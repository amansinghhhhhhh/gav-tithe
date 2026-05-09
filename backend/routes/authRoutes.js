// ─── authRoutes.js ────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { verifyOtp, registerEmail, loginEmail, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateOtp, validateRegister, validateLogin } = require("../middleware/validate");

router.post("/otp/verify", validateOtp, verifyOtp);     // POST /api/auth/otp/verify
router.post("/register", validateRegister, registerEmail); // POST /api/auth/register
router.post("/login", validateLogin, loginEmail);    // POST /api/auth/login
router.get("/me", protect, getMe);         // GET  /api/auth/me

module.exports = router;
