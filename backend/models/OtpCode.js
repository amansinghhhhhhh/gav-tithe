const mongoose = require("mongoose");

// OTP codes stored hashed; doc lives 15 min (TTL) for rate-limit history,
// but the code itself is only valid until validUntil (5 min).
const OtpCodeSchema = new mongoose.Schema(
    {
        mobile: { type: String, required: true, index: true },
        purpose: { type: String, enum: ["register", "profile", "reset"], required: true },
        codeHash: { type: String, required: true },
        validUntil: { type: Date, required: true },
        expiresAt: { type: Date, required: true },
        attempts: { type: Number, default: 0 },
        consumedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpCodeSchema.index({ mobile: 1, purpose: 1, consumedAt: 1 });

module.exports = mongoose.model("OtpCode", OtpCodeSchema);
