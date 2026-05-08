const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getAdmin } = require("../config/firebase");

const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

// ── 1. Firebase OTP verify ────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
    try {
        const { idToken, mobile, name } = req.body;  // ✅ name lo
        if (!idToken) return res.status(400).json({ message: "Firebase ID token required" });

        const decoded = await admin.auth().verifyIdToken(idToken);
        const { uid, phone_number } = decoded;

        let user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            // Naya user — name save karo
            user = await User.create({
                firebaseUid: uid,
                mobile: phone_number || `+91${mobile}`,
                name: name || "",
                isVerified: true,
            });
        } else {
            // Existing user — name update karo
            if (name) {
                user.name = name;
                await user.save();
            }
        }

        res.json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,    // ✅ name response mein
                mobile: user.mobile,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("OTP verify error:", err.message);
        res.status(401).json({ message: "OTP verification failed", error: err.message });
    }
};

// ── 2. Email Register ─────────────────────────────────────────────────────────
const registerEmail = async (req, res) => {
    try {
        const { email, password, mobile, name } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already registered" });

        const user = await User.create({ email, password, mobile, name });
        res.status(201).json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
};

// ── 3. Email Login ────────────────────────────────────────────────────────────
const loginEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        const user = await User.findOne({ email });
        if (!user || !user.password)
            return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        res.json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
};

// ── 4. Get current user ───────────────────────────────────────────────────────
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
        },
    });
};

module.exports = { verifyOtp, registerEmail, loginEmail, getMe };