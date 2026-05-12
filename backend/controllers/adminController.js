const User = require("../models/User");
const FormData = require("../models/FormData");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

// ── Get all users ─────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" })
            .select("-password")
            .sort({ createdAt: -1 });

        // Har user ke saath form status bhi lo
        const usersWithForm = await Promise.all(
            users.map(async (user) => {
                const form = await FormData.findOne({ userId: user._id })
                    .select("status updatedAt section1");
                return {
                    _id: user._id,
                    name: user.name,
                    mobile: user.mobile,
                    email: user.email,
                    createdAt: user.createdAt,
                    formStatus: form?.status || "not_started",
                    formUpdatedAt: form?.updatedAt || null,
                    fullName: form?.section1?.fullName || null,
                };
            })
        );

        res.json({ success: true, users: usersWithForm });
    } catch (err) {
        res.status(500).json({ message: "Failed", error: err.message });
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
        res.status(500).json({ message: "Failed", error: err.message });
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
        res.status(500).json({ message: "Failed", error: err.message });
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
        res.set("Content-Type", file.contentType || "application/octet-stream");
        res.set("Content-Disposition", `inline; filename="${file.filename}"`);

        // Stream karo
        const downloadStream = bucket.openDownloadStream(objectId);
        downloadStream.pipe(res);

        downloadStream.on("error", () => {
            res.status(500).json({ message: "Error streaming file" });
        });

    } catch (err) {
        res.status(500).json({ message: "Failed", error: err.message });
    }
};

module.exports = { getAllUsers, getUserDetail, updateUserStatus, getDocument };