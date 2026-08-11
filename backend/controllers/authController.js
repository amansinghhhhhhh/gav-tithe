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
        const { idToken, mobile, name } = req.body;
        if (!idToken) return res.status(400).json({ message: "Firebase ID token required" });

        const firebaseAdmin = getAdmin();
        if (!firebaseAdmin)
            return res.status(500).json({ message: "Firebase not configured on server" });

        const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
        const { uid, phone_number } = decoded;
        const mobileNumber = phone_number || `+91${mobile}`;

        // ── Check: koi logged-in user hai JWT token se? ───────────────────────
        let loggedInUser = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            try {
                const token = authHeader.split(" ")[1];
                const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET);
                loggedInUser = await User.findById(jwtDecoded.id);
            } catch (_) {
                // Token invalid/expire — ignore, treat as new user
            }
        }

        let user;

        if (loggedInUser) {
            // ── Case 1: Logged-in user hai → usi mein mobile + firebaseUid update karo
            // Pehle check karo yeh mobile kisi aur user ke paas toh nahi
            const mobileConflict = await User.findOne({
                mobile: mobileNumber,
                _id: { $ne: loggedInUser._id },
            });
            if (mobileConflict) {
                return res.status(400).json({
                    success: false,
                    message: "This mobile number is linked to another account",
                });
            }

            loggedInUser.mobile = mobileNumber;
            loggedInUser.firebaseUid = uid;
            loggedInUser.isVerified = true;
            if (name) loggedInUser.name = name;
            await loggedInUser.save();
            user = loggedInUser;

        } else {
            // ── Case 2: Koi logged-in user nahi → firebaseUid ya mobile se dhundo
            user = await User.findOne({
                $or: [{ firebaseUid: uid }, { mobile: mobileNumber }],
            });

            if (!user) {
                user = await User.create({
                    firebaseUid: uid,
                    mobile: mobileNumber,
                    name: name || "",
                    isVerified: true,
                });
            } else {
                user.firebaseUid = uid;
                user.mobile = mobileNumber;
                user.isVerified = true;
                if (name) user.name = name;
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
                email: user.email,
                firebaseUid: user.firebaseUid,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("OTP verify error:", err.message);
        res.status(401).json({ message: "OTP verification failed" });
    }
};

// ── 2. Email Register ─────────────────────────────────────────────────────────
const registerEmail = async (req, res) => {
    try {
        const { email, password, mobile, name, firebaseUid } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail)
            return res.status(400).json({ success: false, message: "Email already registered" });

        // Pehle se koi user is mobile/firebaseUid se exist karta hai? → UPDATE karo
        let user;
        const lookupConditions = [
            ...(firebaseUid ? [{ firebaseUid }] : []),
            ...(mobile ? [{ mobile }] : []),
        ];
        const existingUser = lookupConditions.length
            ? await User.findOne({ $or: lookupConditions })
            : null;

        if (existingUser) {
            // Existing user mil gaya → email/password add karo
            user = existingUser;
            user.email = email;
            if (password) user.password = password;
            if (name) user.name = name;
            if (firebaseUid) user.firebaseUid = firebaseUid;
            if (mobile) user.mobile = mobile;
            user.isVerified = !!user.firebaseUid || user.isVerified;
            await user.save();
            console.log("Existing user updated with email:", email);
        } else {
            // Naya user
            user = new User({
                name: name || email.split("@")[0],
                email,
                password,
                // ⚠️ null set mat karo — sparse unique index null ko bhi index karta hai (E11000 dup)
                mobile: mobile || undefined,
                firebaseUid: firebaseUid || undefined,
                isVerified: !!firebaseUid,
                role: "user",
            });
            await user.save();
        }

        res.json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, firebaseUid: user.firebaseUid, role: user.role },
        });
    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ message: "Registration failed" });
    }
};

// ── 3. Email / Mobile Login ───────────────────────────────────────────────────
const loginEmail = async (req, res) => {
    try {
        const { identifier, password, firebaseIdToken } = req.body;
        // Backward compat: accept `email` field too (admin login, older clients)
        const loginId = identifier || req.body.email;
        if (!loginId)
            return res.status(400).json({ message: "Email or mobile number required" });

        const isEmail = loginId.includes("@");
        let user;

        if (isEmail) {
            user = await User.findOne({ email: loginId.toLowerCase() });
        } else {
            const cleanMobile = loginId.replace(/[^0-9]/g, "").slice(-10);
            user = await User.findOne({
                $or: [
                    { mobile: loginId },
                    { mobile: `+91${loginId}` },
                    { mobile: loginId.replace("+91", "") },
                    { mobile: cleanMobile },
                    { mobile: `+91${cleanMobile}` },
                ],
            });
        }

        console.log("Login - identifier:", loginId, "isEmail:", isEmail, "found:", !!user, "userMobile:", user?.mobile);
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });

        // Firebase token verification — only for email login
        if (firebaseIdToken && isEmail) {
            try {
                const firebaseAdmin = getAdmin();
                if (firebaseAdmin) {
                    const decoded = await firebaseAdmin.auth().verifyIdToken(firebaseIdToken);
                    const emailMatch = decoded.email && decoded.email === loginId.toLowerCase();
                    const uidMatch = user.firebaseUid && decoded.uid === user.firebaseUid;
                    if (!emailMatch && !uidMatch) {
                        return res.status(401).json({ message: "Invalid credentials" });
                    }
                    if (password && user.password) {
                        user.password = password;
                        await user.save();
                    }
                    return res.json({
                        success: true,
                        token: generateToken(user._id),
                        user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, firebaseUid: user.firebaseUid, role: user.role },
                    });
                }
            } catch (e) {
                console.error("Firebase token verify failed:", e.message);
            }
        }

        if (!user.password)
            return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            // Firebase fallback: verify password via Firebase REST API
            // (fixes case where local hash didn't save correctly during registration)
            const fbKey = process.env.FIREBASE_WEB_API_KEY;
            if (fbKey && user.email) {
                try {
                    const resp = await fetch(
                        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${fbKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: user.email, password, returnSecureToken: true }),
                        },
                    );
                    if (resp.ok) {
                        // Password correct according to Firebase → re-hash and save locally
                        user.password = password;
                        await user.save();
                        console.log("Password re-hashed from Firebase for:", user.email);
                        return res.json({
                            success: true,
                            token: generateToken(user._id),
                            user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, firebaseUid: user.firebaseUid, role: user.role },
                        });
                    }
                } catch (_) {}
            }
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, firebaseUid: user.firebaseUid, role: user.role },
        });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ message: "Login failed" });
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
            firebaseUid: user.firebaseUid,
            role: user.role,
        },
    });
};

module.exports = { verifyOtp, registerEmail, loginEmail, getMe };