const FormData = require("../models/FormData");
const EditRequest = require("../models/EditRequest");
const { saveToGridFS, deleteFromGridFS } = require("../middleware/upload");
const { generateUniqueId } = require("../utils/generateUniqueId");

const ALLOWED_DOC_TYPES = ["aadhaarFront", "aadhaarBack", "pan", "udyam", "passport"];

// ── OCR match tolerance (frontend ke same rules) ──────────────────────────────
const CANON = { O: "0", Q: "0", I: "1", L: "1", Z: "2", S: "5", B: "8", G: "6" };
const canonical = (s) => String(s).replace(/[OQILZSBG]/g, (c) => CANON[c]);

const aadhaarMatches = (typed, ocr) => {
    const a = canonical(String(typed || "").toUpperCase()).replace(/\D/g, "");
    const b = canonical(String(ocr || "").toUpperCase()).replace(/\D/g, "");
    return !!a && !!b && a === b;
};

const panMatches = (typed, ocr) => {
    const a = String(typed || "").trim().toUpperCase();
    const b = String(ocr || "").trim().toUpperCase();
    if (!a || !b || a.length !== b.length) return false;
    if (a === b) return true;
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff === 1;
};

// ── Udyam: UDYAM-MH-08-0001234 — hyphens/spaces ignore + canonical tolerance ──
const udyamMatches = (typed, ocr) => {
    const norm = (s) => canonical(String(s || "").toUpperCase()).replace(/[^A-Z0-9]/g, "");
    const a = norm(typed);
    const b = norm(ocr);
    if (!a || !b || a.length !== b.length) return false;
    if (a === b) return true;
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff === 1;
};

const SECTION_ALLOWED_KEYS = {
    section1: ["fullName", "dob", "gender", "mobile", "email", "education", "address", "otpVerified"],
    section2: ["businessName", "businessType", "sector", "sectorOther", "businessStatus", "employment", "investment"],
    section3: ["hadLoan", "loanType", "loanTypeOther", "repaymentStatus", "cibilScore", "pastDifficulty"],
    section4: ["aadhaar", "pan", "udyam", "bankName", "accountNo", "docs"],
};

// ── Section save (draft) ──────────────────────────────────────────────────────
const saveSection = async (req, res) => {
    try {
        const { section, data } = req.body;
        const userId = req.user.id;

        let form = await FormData.findOne({ userId });
        if (!form) form = new FormData({ userId });

        if (section && data) {
            const allowedKeys = SECTION_ALLOWED_KEYS[section] || [];
            const filteredData = Object.fromEntries(
                Object.entries(data).filter(([key]) => allowedKeys.includes(key))
            );
            form[section] = { ...(form[section]?.toObject?.() || {}), ...filteredData };
        }

        form.status = "draft";
        form.updatedAt = Date.now();
        await form.save();

        res.json({ success: true, message: "Draft saved", formId: form._id });
    } catch (err) {
        console.error("Save error:", err.message);
        console.error("Save stack:", err.stack);
        console.error("Save context:", JSON.stringify({ userId, section, hasData: !!data }));
        res.status(500).json({ message: "Save failed" });
    }
};

// ── Full form submit ──────────────────────────────────────────────────────────
const submitForm = async (req, res) => {
    try {
        const userId = req.user.id;
        const { section1, section2, section3, section4 } = req.body;

        console.log("📝 Submit for user:", userId);

        let form = await FormData.findOne({ userId });
        if (!form) form = new FormData({ userId });

        if (section1) form.section1 = section1;
        if (section2) form.section2 = section2;
        if (section3) form.section3 = section3;
        if (section4) {
            // ⚠️ Client se bheja ocr ignore karo — sirf upload ke time ka server-stored OCR valid hai
            const { ocr: _ignoredOcr, ...safeSection4 } = section4;
            form.section4 = {
                ...form.section4?.toObject?.() || {},
                ...safeSection4,
            };
            form.markModified("section4");
        }

        // ── Document-number match check (OCR) ──────────────────────────────
        const docs = form.section4?.docs || {};
        const ocr = form.section4?.ocr || {};

        if (docs.aadhaarFront) {
            const typedAadhaar = String(form.section4?.aadhaar || "").replace(/\s/g, "");
            if (!ocr.aadhaarFront) {
                const msg = form.editAllowed
                    ? "For security reasons, please re-upload the Aadhaar document."
                    : "Aadhaar document could not be read clearly — please re-upload a clear photo/PDF.";
                return res.status(400).json({ success: false, message: msg });
            }
            if (!aadhaarMatches(typedAadhaar, ocr.aadhaarFront)) {
                return res.status(400).json({ success: false, message: "Aadhaar number does not match the document. Enter the correct number or upload the correct document." });
            }
        }

        if (docs.pan) {
            const typedPan = String(form.section4?.pan || "").trim().toUpperCase();
            if (!ocr.pan) {
                const msg = form.editAllowed
                    ? "For security reasons, please re-upload the PAN document."
                    : "PAN document could not be read clearly — please re-upload a clear photo/PDF.";
                return res.status(400).json({ success: false, message: msg });
            }
            if (!panMatches(typedPan, ocr.pan)) {
                return res.status(400).json({ success: false, message: "PAN number does not match the document. Enter the correct number or upload the correct document." });
            }
        }

        if (docs.udyam) {
            const typedUdyam = String(form.section4?.udyam || "").trim().toUpperCase();
            if (!typedUdyam) {
                return res.status(400).json({ success: false, message: "Udyam certificate uploaded — please enter the Udyam Registration Number." });
            }
            if (!ocr.udyam) {
                const msg = form.editAllowed
                    ? "For security reasons, please re-upload the Udyam document."
                    : "Udyam document could not be read clearly — please re-upload a clear photo/PDF.";
                return res.status(400).json({ success: false, message: msg });
            }
            if (!udyamMatches(typedUdyam, ocr.udyam)) {
                return res.status(400).json({ success: false, message: "Udyam number does not match the document. Enter the correct number or upload the correct document." });
            }
        }

        // Unique ID generate karo (sirf first submission pe)
        if (!form.uniqueId) {
            const { dist, taluka, village } = form.section1?.address || {};
            form.uniqueId = await generateUniqueId(dist, taluka, village);
        }

        form.status = "submitted";
        form.editAllowed = false;
        form.updatedAt = Date.now();
        form.submittedAt = Date.now();
        await form.save();

        // Edit request agar pending/approved hai to resolved karo
        await EditRequest.updateMany(
            { userId, status: { $in: ["pending", "approved"] } },
            { $set: { status: "resolved", updatedAt: Date.now() } }
        );

        console.log("✅ Form submitted:", form._id, "| ID:", form.uniqueId);
        res.json({ success: true, message: "Form submitted!", formId: form._id, uniqueId: form.uniqueId });

    } catch (err) {
        console.error("❌ Submit error:", err.message);
        console.error("❌ Stack:", err.stack);
        res.status(500).json({ message: "Submit failed" });
    }
};

// ── Get my form ───────────────────────────────────────────────────────────────
const getMyForm = async (req, res) => {
    try {
        const form = await FormData.findOne({ userId: req.user.id });
        res.json({ success: true, form: form || null });
    } catch (err) {
        console.error("Fetch error:", err.message);
        res.status(500).json({ message: "Fetch failed" });
    }
};

// ── Upload document (GridFS) ──────────────────────────────────────────────────
const uploadDoc = async (req, res) => {
    try {
        const { docType } = req.params;

        if (!ALLOWED_DOC_TYPES.includes(docType)) {
            return res.status(400).json({ message: "Invalid document type" });
        }

        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        let form = await FormData.findOne({ userId: req.user.id });
        if (!form) form = new FormData({ userId: req.user.id });

        if (!form.section4) form.section4 = {};
        if (!form.section4.docs) form.section4.docs = {};

        // ⚠️ Reupload pe purana file delete karo — GridFS me duplicate nahi banna chahiye
        const oldFileId = form.section4.docs[docType];

        const fileId = await saveToGridFS(
            req.file.buffer,
            `${Date.now()}_${req.file.originalname}`,
            req.file.mimetype
        );

        form.section4.docs[docType] = fileId;

        // ✅ Naya save hone ke baad purana delete (fail ho to sirf orphan rehta hai, data safe)
        if (oldFileId) {
            try {
                await deleteFromGridFS(oldFileId);
                console.log("🗑️ Old file deleted (reupload):", oldFileId, "(", docType, ")");
            } catch (e) {
                console.log("⚠️ Old file delete failed (skip):", oldFileId, e.message);
            }
        }

        // ✅ OCR extracted number store karo (aadhaarFront/pan/udyam ke liye)
        if (docType === "aadhaarFront" || docType === "pan" || docType === "udyam") {
            if (!form.section4.ocr) form.section4.ocr = {};
            const ocrValue = typeof req.body.ocr === "string" ? req.body.ocr.trim().toUpperCase().slice(0, 32) : "";
            form.section4.ocr[docType] = ocrValue || null;
        }

        form.markModified("section4");
        form.updatedAt = Date.now();
        await form.save();

        res.json({ success: true, fileId, message: `${docType} uploaded` });
    } catch (err) {
        console.error("Upload error:", err.message);
        res.status(500).json({ message: "Upload failed" });
    }
};

// ── Remove document (GridFS + form fields) ────────────────────────────────────
const removeDoc = async (req, res) => {
    try {
        const { docType } = req.params;

        if (!ALLOWED_DOC_TYPES.includes(docType)) {
            return res.status(400).json({ message: "Invalid document type" });
        }

        const form = await FormData.findOne({ userId: req.user.id });
        if (!form || !form.section4?.docs?.[docType]) {
            return res.json({ success: true, message: "No file to remove" });
        }

        const fileId = form.section4.docs[docType];

        // GridFS se file + chunks delete karo (fail ho to sirf orphan rehta hai)
        try {
            await deleteFromGridFS(fileId);
            console.log("🗑️ File deleted (remove):", fileId, "(", docType, ")");
        } catch (e) {
            console.log("⚠️ File delete failed (skip):", fileId, e.message);
        }

        // Subdocument se `delete` persist nahi hota — plain object bana ke reassign karo
        const docs = form.section4.docs?.toObject ? form.section4.docs.toObject() : form.section4.docs || {};
        delete docs[docType];
        form.section4.docs = docs;
        if (form.section4.ocr) form.section4.ocr[docType] = null;
        form.markModified("section4");
        form.updatedAt = Date.now();
        await form.save();

        res.json({ success: true, message: `${docType} removed` });
    } catch (err) {
        console.error("Remove error:", err.message);
        res.status(500).json({ message: "Remove failed" });
    }
};

// ── Create edit request (ticket) ──────────────────────────────────────────────
const createEditRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Message required" });
        }

        const form = await FormData.findOne({ userId });
        if (!form || form.status !== "submitted") {
            return res.status(400).json({ success: false, message: "Edit requests are only allowed for submitted forms" });
        }

        const existing = await EditRequest.findOne({
            userId,
            status: { $in: ["pending", "approved"] },
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "A request is already pending",
                request: existing,
            });
        }

        const request = await EditRequest.create({
            userId,
            message: message.trim(),
        });

        res.json({ success: true, message: "Edit request sent!", request });
    } catch (err) {
        console.error("Edit request error:", err.message);
        res.status(500).json({ message: "Edit request failed" });
    }
};

// ── Get my edit request ───────────────────────────────────────────────────────
const getMyEditRequest = async (req, res) => {
    try {
        const request = await EditRequest.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, request: request || null });
    } catch (err) {
        console.error("Get edit request error:", err.message);
        res.status(500).json({ message: "Fetch failed" });
    }
};

// ── Get form status by unique ID (public — no auth required) ─────────────────
const getFormByUniqueId = async (req, res) => {
    try {
        const { uniqueId } = req.params;

        if (!uniqueId || !uniqueId.trim()) {
            return res.status(400).json({ success: false, message: "Unique ID is required" });
        }

        const form = await FormData.findOne({ uniqueId: uniqueId.trim().toUpperCase() })
            .select("uniqueId status adminRemark submittedAt updatedAt")
            .lean();

        if (!form) {
            return res.status(404).json({ success: false, message: "No application found with this ID" });
        }

        res.json({
            success: true,
            uniqueId: form.uniqueId,
            status: form.status,
            adminRemark: form.adminRemark || "",
            submittedAt: form.submittedAt,
            updatedAt: form.updatedAt,
        });
    } catch (err) {
        console.error("Get form by uniqueId error:", err.message);
        res.status(500).json({ message: "Fetch failed" });
    }
};

module.exports = { saveSection, submitForm, getMyForm, uploadDoc, removeDoc, createEditRequest, getMyEditRequest, getFormByUniqueId };