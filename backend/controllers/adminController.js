const User = require("../models/User");
const FormData = require("../models/FormData");
const EditRequest = require("../models/EditRequest");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const ExcelJS = require("exceljs");

// ── Get all users ─────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" })
            .select("-password")
            .sort({ createdAt: -1 });

        const userIds = users.map((u) => u._id);

        const forms = await FormData.find({ userId: { $in: userIds } })
            .select("userId status updatedAt submittedAt section1");

        const formMap = {};
        for (const form of forms) {
            formMap[form.userId.toString()] = form;
        }

        const usersWithForm = users.map((user) => {
            const form = formMap[user._id.toString()];
            return {
                _id: user._id,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                createdAt: user.createdAt,
                formStatus: form?.status || "not_started",
                formUpdatedAt: form?.updatedAt || null,
                formSubmittedAt: form?.submittedAt || null,
                fullName: form?.section1?.fullName || null,
            };
        });

        res.json({ success: true, users: usersWithForm });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Get single user detail ────────────────────────────────────────────────────
const getUserDetail = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        const form = await FormData.findOne({ userId });

        res.json({ success: true, user, form: form || null });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Update user form status (approve/reject) ──────────────────────────────────
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, remark } = req.body;

        const allowed = ["approved", "rejected", "under_review", "submitted"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const form = await FormData.findOne({ userId });
        if (!form) return res.status(404).json({ message: "Form not found" });

        form.status = status;
        if (remark) form.adminRemark = remark;
        form.updatedAt = Date.now();
        await form.save();

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Get document from GridFS ──────────────────────────────────────────────────
const getDocument = async (req, res) => {
    try {
        const { fileId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: "Invalid file ID" });
        }

        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: "uploads" });

        const objectId = new mongoose.Types.ObjectId(fileId);

        // File info lo
        const files = await bucket.find({ _id: objectId }).toArray();
        if (!files.length) {
            return res.status(404).json({ message: "File not found" });
        }

        const file = files[0];
        // Strip dangerous chars from filename to prevent header injection
        const safeFilename = (file.filename || "document").replace(/[^\w.\-]/g, "_");
        res.set("Content-Type", file.contentType || "application/octet-stream");
        res.set("Content-Disposition", `attachment; filename="${safeFilename}"`);

        // Stream karo
        const downloadStream = bucket.openDownloadStream(objectId);
        downloadStream.pipe(res);

        downloadStream.on("error", () => {
            res.status(500).json({ message: "Error streaming file" });
        });

    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Export all users as Excel ─────────────────────────────────────────────────
const exportExcel = async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("-password").lean();
        const userIds = users.map(u => u._id);
        const forms = await FormData.find({ userId: { $in: userIds } }).lean();

        const formMap = {};
        for (const f of forms) formMap[f.userId.toString()] = f;

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Applications");

        ws.columns = [
            { header: "Name", key: "name", width: 20 },
            { header: "Mobile", key: "mobile", width: 15 },
            { header: "Email", key: "email", width: 25 },
            { header: "Status", key: "status", width: 14 },
            { header: "Registered On", key: "registeredOn", width: 14 },
            { header: "Form Submitted On", key: "submittedOn", width: 16 },
            { header: "Full Name", key: "fullName", width: 20 },
            { header: "DOB", key: "dob", width: 12 },
            { header: "Gender", key: "gender", width: 10 },
            { header: "Education", key: "education", width: 16 },
            { header: "Dist", key: "dist", width: 14 },
            { header: "Taluka", key: "taluka", width: 14 },
            { header: "Village", key: "village", width: 14 },
            { header: "Pincode", key: "pincode", width: 10 },
            { header: "Business Name", key: "businessName", width: 20 },
            { header: "Business Type", key: "businessType", width: 16 },
            { header: "Sector", key: "sector", width: 16 },
            { header: "Business Status", key: "businessStatus", width: 16 },
            { header: "Employment", key: "employment", width: 14 },
            { header: "Investment", key: "investment", width: 14 },
            { header: "Had Loan", key: "hadLoan", width: 10 },
            { header: "Loan Type", key: "loanType", width: 14 },
            { header: "Repayment", key: "repaymentStatus", width: 14 },
            { header: "CIBIL Score", key: "cibilScore", width: 12 },
            { header: "Aadhaar", key: "aadhaar", width: 16 },
            { header: "PAN", key: "pan", width: 12 },
            { header: "Udyam", key: "udyam", width: 18 },
            { header: "Bank Name", key: "bankName", width: 18 },
            { header: "Account No", key: "accountNo", width: 18 },
        ];

        ws.getRow(1).font = { bold: true };

        for (const user of users) {
            const f = formMap[user._id.toString()];
            const s1 = f?.section1 || {};
            const s2 = f?.section2 || {};
            const s3 = f?.section3 || {};
            const s4 = f?.section4 || {};
            const addr = typeof s1.address === "object" ? s1.address : {};

            ws.addRow({
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                status: f?.status || "not_started",
                registeredOn: user.createdAt,
                submittedOn: f?.submittedAt || null,
                fullName: s1.fullName,
                dob: s1.dob,
                gender: s1.gender,
                education: s1.education,
                dist: addr.dist,
                taluka: addr.taluka,
                village: addr.village,
                pincode: addr.pincode,
                businessName: s2.businessName,
                businessType: s2.businessType,
                sector: s2.sector === "other" ? `Other - ${s2.sectorOther || ""}` : s2.sector,
                businessStatus: s2.businessStatus,
                employment: s2.employment,
                investment: s2.investment,
                hadLoan: s3.hadLoan,
                loanType: s3.loanType === "other" ? `Other - ${s3.loanTypeOther || ""}` : s3.loanType,
                repaymentStatus: s3.repaymentStatus,
                cibilScore: s3.cibilScore,
                aadhaar: s4.aadhaar,
                pan: s4.pan,
                udyam: s4.udyam,
                bankName: s4.bankName,
                accountNo: s4.accountNo,
            });
        }

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=applications.xlsx");
        await wb.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("Excel export error:", err.message);
        res.status(500).json({ message: "Export failed" });
    }
};

// ── Get all edit requests ─────────────────────────────────────────────────────
const getEditRequests = async (req, res) => {
    try {
        const requests = await EditRequest.find().sort({ createdAt: -1 }).lean();

        const userIds = [...new Set(requests.map((r) => r.userId))];
        const users = await User.find({ _id: { $in: userIds } })
            .select("name mobile email")
            .lean();
        const userMap = {};
        for (const u of users) userMap[u._id.toString()] = u;

        const data = requests.map((r) => ({
            ...r,
            userId: undefined,
            user: userMap[r.userId.toString()] || null,
        }));

        res.json({ success: true, requests: data });
    } catch (err) {
        console.error("Get edit requests error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Update edit request (approve/reject) ──────────────────────────────────────
const updateEditRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remark } = req.body;

        const allowed = ["approved", "rejected"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const request = await EditRequest.findById(id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = status;
        if (remark) request.remark = remark;
        request.updatedAt = Date.now();
        await request.save();

        // Approve hone par user ka form edit ke liye khol do
        // ⚠️ Security: purana OCR verification invalid karo — user ko docs dobara upload karne padenge
        if (status === "approved") {
            const form = await FormData.findOne({ userId: request.userId });
            if (form) {
                form.editAllowed = true;
                if (form.section4) {
                    form.section4.ocr = { aadhaarFront: null, pan: null, udyam: null };
                    form.markModified("section4");
                }
                form.updatedAt = Date.now();
                await form.save();
            }
        }

        res.json({ success: true, message: `Request ${status}` });
    } catch (err) {
        console.error("Update edit request error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Delete user + saara related data ──────────────────────────────────────────
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role === "admin") {
            return res.status(400).json({ message: "Admin user delete nahi kar sakte" });
        }

        const form = await FormData.findOne({ userId });

        // ── GridFS files delete (uploads.files + uploads.chunks dono) ──────
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: "uploads" });
        const docs = form?.section4?.docs || {};
        for (const docType of Object.keys(docs)) {
            const fileId = docs[docType];
            if (!fileId) continue;
            try {
                await bucket.delete(new mongoose.Types.ObjectId(fileId.toString()));
                console.log("🗑️ Deleted GridFS file:", fileId, "(", docType, ")");
            } catch (e) {
                console.log("⚠️ GridFS file missing (skip):", fileId, e.message);
            }
        }

        // ── FormData + EditRequests + User ──────────────────────────────────
        if (form) await FormData.deleteOne({ _id: form._id });
        await EditRequest.deleteMany({ userId });
        await User.deleteOne({ _id: userId });

        console.log("🗑️ User deleted:", userId);
        res.json({ success: true, message: "User aur saara data delete ho gaya" });
    } catch (err) {
        console.error("Delete user error:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getAllUsers, getUserDetail, updateUserStatus, getDocument, exportExcel, getEditRequests, updateEditRequest, deleteUser };