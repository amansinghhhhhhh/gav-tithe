const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const { Readable } = require("stream");

// Memory storage — file buffer mein rakho, phir GridFS mein save karo
const storage = multer.memoryStorage();

const FILE_MAX = 5 * 1024 * 1024;  // 5 MB for all files

const upload = multer({
    storage,
    limits: { fileSize: FILE_MAX },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only JPG, PNG, WEBP, PDF allowed"), false);
        }
        cb(null, true);
    },
});

// Server-side magic bytes verification (client-controlled Content-Type par bharosa nahi)
const checkBytes = (file) => {
    const buf = file.buffer;
    if (file.mimetype === "image/jpeg")
        return buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
    if (file.mimetype === "image/png")
        return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
    if (file.mimetype === "image/webp")
        return buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46;
    if (file.mimetype === "application/pdf")
        return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
    return false;
};

// upload.single ke baad use karo
const verifyMagicBytes = (req, res, next) => {
    if (req.file && !checkBytes(req.file)) {
        return res.status(400).json({ message: "File content does not match declared type" });
    }
    next();
};

// upload.fields ke baad use karo
const verifyMagicBytesFields = (req, res, next) => {
    if (req.files) {
        for (const fileArr of Object.values(req.files)) {
            for (const file of fileArr) {
                if (!checkBytes(file)) {
                    return res.status(400).json({ message: "File content does not match declared type" });
                }
            }
        }
    }
    next();
};

// GridFS mein file save karne ka helper
const saveToGridFS = (fileBuffer, filename, mimetype) => {
    return new Promise((resolve, reject) => {
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: "uploads" });

        const uploadStream = bucket.openUploadStream(filename, {
            contentType: mimetype,
        });

        const readable = new Readable();
        readable.push(fileBuffer);
        readable.push(null);
        readable.pipe(uploadStream);

        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.on("error", reject);
    });
};

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.code === "LIMIT_FILE_SIZE" ? "File size max 5MB" : err.message });
    }
    if (err) return res.status(400).json({ message: err.message });
    next();
};

module.exports = { upload, saveToGridFS, verifyMagicBytes, verifyMagicBytesFields, handleMulterError };