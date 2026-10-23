const mongoose = require("mongoose");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const SevaFirstApplication = require("../models/SevaFirstApplication");
const { saveToGridFS } = require("../middleware/upload");

// ── Multer (Seva First: alag limits per field) ────────────────────────────────
const MB = 1024 * 1024;

const FIELD_LIMITS = {
    ppt: 15 * MB,
    idProof: 5 * MB,
    prototype: 10 * MB,
    research: 5 * MB,
};

const FIELD_MIME = {
    ppt: [
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-powerpoint",
        "application/pdf",
    ],
    idProof: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    prototype: ["application/pdf", "image/jpeg", "image/png", "image/webp", "application/zip"],
    research: ["application/pdf"],
};

const sevaUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * MB },
    fileFilter: (req, file, cb) => {
        const allowed = FIELD_MIME[file.fieldname];
        if (!allowed || !allowed.includes(file.mimetype)) {
            return cb(new Error(`Invalid file type for ${file.fieldname}`), false);
        }
        cb(null, true);
    },
});

const handleSevaMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const maxMB = FIELD_LIMITS[err.field] ? FIELD_LIMITS[err.field] / MB : 15;
        return res.status(400).json({
            success: false,
            message: err.code === "LIMIT_FILE_SIZE" ? `File too large (max ${maxMB}MB)` : err.message,
        });
    }
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
};

// ── Magic bytes (server-side type verify, client MIME par bharosa nahi) ───────
const checkBytes = (file) => {
    const buf = file.buffer;
    if (!buf || buf.length < 4) return false;
    switch (file.mimetype) {
        case "application/pdf":
            return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
        case "image/jpeg":
            return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
        case "image/png":
            return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
        case "image/webp":
            return buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46;
        case "application/zip":
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            return buf[0] === 0x50 && buf[1] === 0x4b;
        case "application/vnd.ms-powerpoint":
            return true; // legacy OLE — bahut varied headers
        default:
            return false;
    }
};

// ── Unique ID: SF-XXXXXX ──────────────────────────────────────────────────────
const generateSfId = async () => {
    for (let attempt = 0; attempt < 10; attempt++) {
        const id = "SF-" + String(Math.floor(100000 + Math.random() * 900000));
        const exists = await SevaFirstApplication.findOne({ uniqueId: id }).lean();
        if (!exists) return id;
    }
    throw new Error("Could not generate unique ID");
};

// ── Public: form submit ───────────────────────────────────────────────────────
const submitSeva = async (req, res) => {
    try {
        const {
            applicantName, mobile, email, location, aadhaar, pan = "",
            teamMembers, category, problem, solution,
            cost, timelineMonths, implementationPlan, videoLink = "",
        } = req.body;

        // Required fields
        if (!applicantName?.trim() || !mobile?.trim() || !email?.trim() || !location?.trim() || !aadhaar?.trim()) {
            return res.status(400).json({ success: false, message: "All applicant fields are required" });
        }
        if (!/^\d{10}$/.test(mobile.trim())) {
            return res.status(400).json({ success: false, message: "Mobile number must be 10 digits" });
        }
        if (!/^\d{12}$/.test(aadhaar.trim())) {
            return res.status(400).json({ success: false, message: "Aadhaar must be 12 digits" });
        }
        if (!category?.trim() || !problem?.trim() || !solution?.trim()) {
            return res.status(400).json({ success: false, message: "Category, problem and solution are required" });
        }
        const costNum = Number(cost);
        const timelineNum = Number(timelineMonths);
        if (!costNum || costNum < 1000 || !timelineNum || timelineNum < 1 || timelineNum > 60 || !implementationPlan?.trim()) {
            return res.status(400).json({ success: false, message: "Valid cost, timeline and implementation plan are required" });
        }

        // Required files
        const files = req.files || {};
        if (!files.ppt?.length || !files.idProof?.length) {
            return res.status(400).json({ success: false, message: "PPT and ID proof files are required" });
        }

        // Magic bytes verify + per-field size check
        for (const field of Object.keys(files)) {
            for (const f of files[field]) {
                if (!checkBytes(f)) {
                    return res.status(400).json({ success: false, message: `File content does not match declared type (${field})` });
                }
                if (f.size > FIELD_LIMITS[field]) {
                    return res.status(400).json({ success: false, message: `${field} file too large (max ${FIELD_LIMITS[field] / MB}MB)` });
                }
            }
        }

        // Parse team members (JSON string aata hai multipart se)
        let team = [];
        try {
            const parsed = typeof teamMembers === "string" ? JSON.parse(teamMembers) : teamMembers;
            if (Array.isArray(parsed)) {
                team = parsed
                    .filter((m) => m && (m.name?.trim() || m.role?.trim() || m.contact?.trim()))
                    .map((m) => ({ name: m.name || "", role: m.role || "", contact: m.contact || "" }));
            }
        } catch { /* ignore bad JSON */ }

        // GridFS me save
        const saved = {};
        for (const field of ["ppt", "idProof", "prototype", "research"]) {
            const f = files[field]?.[0];
            if (f) {
                const safeName = `seva_${field}_${Date.now()}_${(f.originalname || field).replace(/[^\w.\-]/g, "_")}`;
                saved[field] = await saveToGridFS(f.buffer, safeName, f.mimetype);
            }
        }

        const uniqueId = await generateSfId();

        const app = await SevaFirstApplication.create({
            userId: req.user.id,
            uniqueId,
            applicant: {
                name: applicantName.trim(),
                mobile: mobile.trim(),
                email: email.trim().toLowerCase(),
                location: location.trim(),
                aadhaar: aadhaar.trim(),
                pan: (pan || "").trim().toUpperCase(),
            },
            teamMembers: team,
            idea: { category: category.trim(), problem: problem.trim(), solution: solution.trim() },
            budget: {
                cost: costNum,
                timelineMonths: timelineNum,
                implementationPlan: implementationPlan.trim(),
                videoLink: (videoLink || "").trim(),
            },
            files: {
                ppt: saved.ppt || null,
                idProof: saved.idProof || null,
                prototype: saved.prototype || null,
                research: saved.research || null,
            },
        });

        res.status(201).json({ success: true, uniqueId: app.uniqueId, applicationId: app._id, message: "Application submitted" });
    } catch (err) {
        console.error("Seva submit error:", err.message);
        res.status(500).json({ success: false, message: "Submission failed" });
    }
};

// ── Public: my applications (choice screen status) ────────────────────────────
const getMySevaApps = async (req, res) => {
    try {
        const apps = await SevaFirstApplication.find({ userId: req.user.id })
            .select("uniqueId idea.category budget.cost status createdAt")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, applications: apps });
    } catch (err) {
        console.error("Get my seva apps error:", err.message);
        res.status(500).json({ success: false, message: "Fetch failed" });
    }
};

// ── Public: my document (GridFS, sirf apna file) ──────────────────────────────
const getMySevaDocument = async (req, res) => {
    try {
        const { fileId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: "Invalid file ID" });
        }
        const fields = ["ppt", "idProof", "prototype", "research"].map((k) => `files.${k}`);
        const app = await SevaFirstApplication.findOne({
            userId: req.user.id,
            $or: fields.map((f) => ({ [f]: fileId })),
        });
        if (!app) return res.status(404).json({ message: "File not found" });

        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: "uploads" });
        const objectId = new mongoose.Types.ObjectId(fileId);
        const files = await bucket.find({ _id: objectId }).toArray();
        if (!files.length) return res.status(404).json({ message: "File not found" });

        const file = files[0];
        const safeFilename = (file.filename || "document").replace(/[^\w.\-]/g, "_");
        res.set("Content-Type", file.contentType || "application/octet-stream");
        res.set("Content-Disposition", `inline; filename="${safeFilename}"`);
        res.set("Cache-Control", "private, max-age=3600");
        bucket.openDownloadStream(objectId).pipe(res).on("error", () => res.status(500).json({ message: "Error streaming file" }));
    } catch (err) {
        console.error("Get seva document error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Admin: list (search + status filter + pagination) ─────────────────────────
const adminListSeva = async (req, res) => {
    try {
        const { q = "", status = "", page = 1, limit = 50 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (q.trim()) {
            const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            filter.$or = [{ uniqueId: rx }, { "applicant.name": rx }, { "applicant.mobile": rx }, { "applicant.email": rx }];
        }
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(200, Math.max(1, Number(limit) || 50));

        const [total, apps] = await Promise.all([
            SevaFirstApplication.countDocuments(filter),
            SevaFirstApplication.find(filter)
                .select("uniqueId applicant idea.category idea.problem budget.cost status createdAt")
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean(),
        ]);
        res.json({ success: true, applications: apps, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    } catch (err) {
        console.error("Admin seva list error:", err.message);
        res.status(500).json({ success: false, message: "Fetch failed" });
    }
};

// ── Admin: detail ─────────────────────────────────────────────────────────────
const adminGetSeva = async (req, res) => {
    try {
        const app = await SevaFirstApplication.findById(req.params.id).lean();
        if (!app) return res.status(404).json({ success: false, message: "Application not found" });
        res.json({ success: true, application: app });
    } catch (err) {
        console.error("Admin seva detail error:", err.message);
        res.status(500).json({ success: false, message: "Fetch failed" });
    }
};

// ── Admin: update status + remark ─────────────────────────────────────────────
const adminUpdateSevaStatus = async (req, res) => {
    try {
        const { status, adminRemark = "" } = req.body;
        const allowed = ["submitted", "under_review", "approved", "rejected"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }
        const app = await SevaFirstApplication.findByIdAndUpdate(
            req.params.id,
            { status, adminRemark },
            { new: true }
        ).lean();
        if (!app) return res.status(404).json({ success: false, message: "Application not found" });
        res.json({ success: true, application: app, message: "Status updated" });
    } catch (err) {
        console.error("Admin seva status error:", err.message);
        res.status(500).json({ success: false, message: "Update failed" });
    }
};

// ── Admin: file stream (kisi bhi seva application ka doc) ─────────────────────
const adminGetSevaFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: "Invalid file ID" });
        }
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: "uploads" });
        const objectId = new mongoose.Types.ObjectId(fileId);
        const files = await bucket.find({ _id: objectId }).toArray();
        if (!files.length) return res.status(404).json({ message: "File not found" });

        const file = files[0];
        const safeFilename = (file.filename || "document").replace(/[^\w.\-]/g, "_");
        res.set("Content-Type", file.contentType || "application/octet-stream");
        res.set("Content-Disposition", `inline; filename="${safeFilename}"`);
        bucket.openDownloadStream(objectId).pipe(res).on("error", () => res.status(500).json({ message: "Error streaming file" }));
    } catch (err) {
        console.error("Admin seva file error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Admin: delete application (+ GridFS file cleanup) ─────────────────────────
const adminDeleteSeva = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid ID" });
        }
        const app = await SevaFirstApplication.findByIdAndDelete(req.params.id).lean();
        if (!app) return res.status(404).json({ success: false, message: "Application not found" });

        try {
            const db = mongoose.connection.db;
            const bucket = new GridFSBucket(db, { bucketName: "uploads" });
            for (const key of ["ppt", "idProof", "prototype", "research"]) {
                const fid = app.files && app.files[key];
                if (fid) await bucket.delete(new mongoose.Types.ObjectId(fid)).catch(() => {});
            }
        } catch (e) {
            console.error("Seva GridFS cleanup error:", e.message);
        }

        res.json({ success: true, message: "Deleted successfully" });
    } catch (err) {
        console.error("Admin seva delete error:", err.message);
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};

module.exports = {
    sevaUpload,
    handleSevaMulterError,
    submitSeva,
    getMySevaApps,
    getMySevaDocument,
    adminListSeva,
    adminGetSeva,
    adminUpdateSevaStatus,
    adminGetSevaFile,
    adminDeleteSeva,
};
