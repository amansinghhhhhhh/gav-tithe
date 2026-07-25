const FormData = require("../models/FormData");
const { saveToGridFS } = require("../middleware/upload");

const ALLOWED_DOC_TYPES = ["aadhaarFront", "aadhaarBack", "pan", "udyam", "passport"];

const SECTION_ALLOWED_KEYS = {
    section1: ["fullName", "dob", "gender", "mobile", "email", "education", "address", "otpVerified"],
    section2: ["businessName", "businessType", "sector", "sectorOther", "businessStatus", "employment", "investment"],
    section3: ["hadLoan", "loanType", "loanTypeOther", "repaymentStatus", "cibilScore", "pastDifficulty"],
    section4: ["aadhaar", "pan", "bankName", "accountNo", "docs"],
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
            form.section4 = {
                ...form.section4?.toObject?.() || {},
                ...section4,
            };
            form.markModified("section4");
        }

        form.status = "submitted";
        form.updatedAt = Date.now();
        await form.save();

        console.log("✅ Form submitted:", form._id);
        res.json({ success: true, message: "Form submitted!", formId: form._id });

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

        const fileId = await saveToGridFS(
            req.file.buffer,
            `${Date.now()}_${req.file.originalname}`,
            req.file.mimetype
        );

        let form = await FormData.findOne({ userId: req.user.id });
        if (!form) form = new FormData({ userId: req.user.id });

        if (!form.section4) form.section4 = {};
        if (!form.section4.docs) form.section4.docs = {};
        form.section4.docs[docType] = fileId;
        form.markModified("section4");
        form.updatedAt = Date.now();
        await form.save();

        res.json({ success: true, fileId, message: `${docType} uploaded` });
    } catch (err) {
        console.error("Upload error:", err.message);
        res.status(500).json({ message: "Upload failed" });
    }
};

module.exports = { saveSection, submitForm, getMyForm, uploadDoc };