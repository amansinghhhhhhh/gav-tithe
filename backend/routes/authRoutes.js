const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { verifyOtp, registerEmail, loginEmail, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateOtp, validateRegister, validateLogin } = require("../middleware/validate");

router.post("/otp/verify", validateOtp, verifyOtp);
router.post("/register", validateRegister, registerEmail);
router.post("/login", validateLogin, loginEmail);
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
router.post("/check-same-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) return res.status(400).json({ success: false, message: "Email and password required" });
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.password) return res.json({ success: true, message: "No password to compare" });
        const isSame = await bcrypt.compare(newPassword, user.password);
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