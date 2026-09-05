const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { verifyOtp, registerEmail, loginEmail, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateOtp, validateRegister, validateLogin } = require("../middleware/validate");

// ── Strict limiter sirf login/register/otp ke liye ──
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const waitMs = req.rateLimit.resetTime - Date.now();
        const waitMin = Math.ceil(waitMs / 60000);
        res.status(429).json({
            message: `Too many login attempts. Please try again in ${waitMin} minute(s).`,
            retryAfterMinutes: waitMin,
        });
    },
});

router.post("/otp/verify", strictLimiter, validateOtp, verifyOtp);
router.post("/register", strictLimiter, validateRegister, registerEmail);
router.post("/login", strictLimiter, validateLogin, loginEmail);
router.get("/me", protect, getMe);
router.post("/check-email", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ success: false, message: "Email not registered" });
        res.json({ success: true, message: "Email found" });
    } catch (err) {
        console.error("Check email error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});
router.post("/check-mobile", async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ success: false, message: "Mobile required" });
        const clean = mobile.replace(/[^0-9]/g, "").slice(-10);
        if (clean.length !== 10) return res.status(400).json({ success: false, message: "Invalid mobile" });
        const user = await User.findOne({ mobile: { $in: [`+91${clean}`, `91${clean}`, clean] } });
        if (user) return res.status(400).json({ success: false, message: "already_registered" });
        res.json({ success: true, message: "Mobile available" });
    } catch (err) {
        console.error("Check mobile error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});
router.post("/check-same-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        console.log("check-same-password called:", { email, newPasswordLength: newPassword?.length });
        if (!email || !newPassword) return res.status(400).json({ success: false, message: "Email and password required" });
        const user = await User.findOne({ email: email.toLowerCase() });
        console.log("User found:", !!user, "hasPassword:", !!user?.password);
        if (!user || !user.password) return res.json({ success: true, message: "No password to compare" });
        const isSame = await bcrypt.compare(newPassword, user.password);
        console.log("Password same:", isSame);
        if (isSame) return res.status(400).json({ success: false, message: "Same password" });
        res.json({ success: true, message: "Different password" });
    } catch (err) {
        console.error("Check same password error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});
// Email verification requires a signed token sent to user's inbox.
// This endpoint is intentionally disabled until email sending is implemented.
router.post("/verify-email", protect, async (req, res) => {
    return res.status(501).json({ message: "Email verification not implemented" });
});

module.exports = router;