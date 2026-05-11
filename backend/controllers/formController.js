const FormData = require("../models/FormData");
const { saveToGridFS } = require("../middleware/upload");

// ── Section save (draft) ──────────────────────────────────────────────────────
const saveSection = async (req, res) => {
    try {
        const { section, data } = req.body;
        const userId = req.user.id;

        let form = await FormData.findOne({ userId });
        if (!form) form = new FormData({ userId });

        if (section && data) {
            form[section] = { ...(form[section]?.toObject?.() || {}), ...data };
        }

        form.status = "draft";
        form.updatedAt = Date.now();
        await form.save();

        res.json({ success: true, message: "Draft saved", formId: form._id });
    } catch (err) {
        res.status(500).json({ message: "Save failed", error: err.message });
    }
};

// ── Full form submit ──────────────────────────────────────────────────────────
const submitForm = async (req, res) => {
    try {
        const userId = req.user.id;

        // FormData se JSON parse karo
        const section1 = req.body.section1 ? JSON.parse(req.body.section1) : null;
        const section2 = req.body.section2 ? JSON.parse(req.body.section2) : null;
        const section3 = req.body.section3 ? JSON.parse(req.body.section3) : null;
        const section4 = req.body.section4 ? JSON.parse(req.body.section4) : null;

        console.log("📝 Submit for user:", userId);
        console.log("📁 Files received:", req.files ? Object.keys(req.files) : "none");

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

        // ✅ Files GridFS mein save karo
        if (req.files) {
            const docMap = {
                doc_aadhaar: "aadhaar",
                doc_pan: "pan",
                doc_udyam: "udyam",
                doc_passport: "passport",
            };

            for (const [fieldName, docKey] of Object.entries(docMap)) {
                const fileArr = req.files[fieldName];
                if (fileArr?.[0]) {
                    const file = fileArr[0];
                    console.log(`📤 Saving ${docKey} to GridFS...`);

                    const fileId = await saveToGridFS(
                        file.buffer,
                        `${Date.now()}_${file.originalname}`,
                        file.mimetype
                    );

                    if (!form.section4) form.section4 = {};
                    if (!form.section4.docs) form.section4.docs = {};
                    form.section4.docs[docKey] = fileId;
                    form.markModified("section4");

                    console.log(`✅ ${docKey} saved with ID:`, fileId);
                }
            }
        }

        form.status = "submitted";
        form.updatedAt = Date.now();
        await form.save();

        console.log("✅ Form submitted:", form._id);
        res.json({ success: true, message: "Form submitted!", formId: form._id });

    } catch (err) {
        console.error("❌ Submit error:", err.message);
        console.error("❌ Stack:", err.stack);
        res.status(500).json({ message: "Submit failed", error: err.message });
    }
};

// ── Get my form ───────────────────────────────────────────────────────────────
const getMyForm = async (req, res) => {
    try {
        const form = await FormData.findOne({ userId: req.user.id });
        res.json({ success: true, form: form || null });
    } catch (err) {
        res.status(500).json({ message: "Fetch failed", error: err.message });
    }
};

// ── Upload document (GridFS) ──────────────────────────────────────────────────
const uploadDoc = async (req, res) => {
    try {
        const { docType } = req.params;

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
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
};

module.exports = { saveSection, submitForm, getMyForm, uploadDoc };