const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getAdmin } = require("../config/firebase");
const bcrypt = require("bcryptjs"); // ← ye line honi chahiye
const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

// ── 1. Firebase OTP verify ────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
    try {
        const { idToken, mobile, name } = req.body;
        if (!idToken) return res.status(400).json({ message: "Firebase ID token required" });

        // ✅ firebaseAdmin naam use karo — 'admin' se conflict nahi hoga
        const firebaseAdmin = getAdmin();
        if (!firebaseAdmin) {
            return res.status(500).json({ message: "Firebase not configured on server" });
        }

        const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
        const { uid, phone_number } = decoded;

        let user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                mobile: phone_number || `+91${mobile}`,
                name: name || "",
                isVerified: true,
            });
        } else {
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
                name: user.name,
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

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "Email already registered hai" });
        }

        // ✅ Plain password do — pre-save hook hash karega
        const user = new User({
            name: name || email.split("@")[0],
            email,
            password,        // ← NO bcrypt.hash here
            mobile: mobile || null,
            role: "user",
        });

        await user.save(); // ← pre-save hook trigger hoga

        const token = generateToken(user._id);
        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error("❌ Register error:", err.message);
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
};
// ── 3. Email Login ────────────────────────────────────────────────────────────
const loginEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("📧 Login attempt:", email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("👤 User found:", user.email, "Role:", user.role);
        console.log("🔑 Comparing passwords...");

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("✅ Password match:", isMatch);

        if (!isMatch) {
            console.log("❌ Password mismatch!");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("❌ Login error:", err.message);
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