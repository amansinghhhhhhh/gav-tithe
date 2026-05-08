// ─── authRoutes.js ────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { verifyOtp, registerEmail, loginEmail, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/otp/verify", verifyOtp);       // POST /api/auth/otp/verify
router.post("/register", registerEmail);   // POST /api/auth/register
router.post("/login", loginEmail);      // POST /api/auth/login
router.get("/me", protect, getMe);          // GET  /api/auth/me

module.exports = router;

