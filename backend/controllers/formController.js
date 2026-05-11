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
        const { section1, section2, section3, section4 } = req.body;
        const userId = req.user.id;

        console.log("📝 Submit form for user:", userId);
        console.log("📦 Sections received:", {
            s1: !!section1, s2: !!section2,
            s3: !!section3, s4: !!section4
        });

        let form = await FormData.findOne({ userId });
        if (!form) form = new FormData({ userId });

        if (section1) form.section1 = section1;
        if (section2) form.section2 = section2;
        if (section3) form.section3 = section3;
        if (section4) {
            // docs ko alag handle karo — empty objects ignore karo
            const { docs, ...section4Data } = section4;
            form.section4 = { ...form.section4?.toObject?.() || {}, ...section4Data };

            // Sirf valid file IDs save karo
            if (docs) {
                const validDocs = {};
                Object.keys(docs).forEach(key => {
                    const val = docs[key];
                    if (val && typeof val === "string" && val.length > 0) {
                        validDocs[key] = val;
                    }
                });
                if (Object.keys(validDocs).length > 0) {
                    form.section4.docs = { ...form.section4.docs?.toObject?.() || {}, ...validDocs };
                    form.markModified("section4.docs");
                }
            }
            form.markModified("section4");
        }

        form.status = "submitted";
        form.updatedAt = Date.now();
        await form.save();

        console.log("✅ Form submitted successfully:", form._id);
        res.json({ success: true, message: "Form submitted!", formId: form._id });
    } catch (err) {
        console.error("❌ Submit error:", err.message);
        console.error("❌ Submit error stack:", err.stack);
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

        // Memory buffer → GridFS
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