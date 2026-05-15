const express = require("express");
const router = express.Router();
const User = require("../models/User"); // ← YEH ADD KARO
const { verifyOtp, registerEmail, loginEmail, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateOtp, validateRegister, validateLogin } = require("../middleware/validate");

router.post("/otp/verify", validateOtp, verifyOtp);
router.post("/register", validateRegister, registerEmail);
router.post("/login", validateLogin, loginEmail);
router.get("/me", protect, getMe);
// Email verification requires a signed token sent to user's inbox.
// This endpoint is intentionally disabled until email sending is implemented.
router.post("/verify-email", protect, async (req, res) => {
    return res.status(501).json({ message: "Email verification not implemented" });
});

module.exports = router;