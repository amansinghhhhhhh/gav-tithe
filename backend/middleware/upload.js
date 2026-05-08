const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const { Readable } = require("stream");

// Memory storage — file buffer mein rakho, phir GridFS mein save karo
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "application/pdf"];
        allowed.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error("Only JPG, PNG, PDF allowed"), false);
    },
});

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

module.exports = { upload, saveToGridFS };