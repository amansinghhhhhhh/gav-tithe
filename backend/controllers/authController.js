const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OtpCode = require("../models/OtpCode");
const { getAdmin } = require("../config/firebase");
const { sendOtpSms } = require("../services/magicText");

const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

// ── Brute-force login lockout (in-memory): 5 wrong tries → 15 min block ──────
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILS = 5;
const loginFails = new Map();

const lockKeyOf = (id) => {
    const s = String(id || "").toLowerCase().trim();
    return s.includes("@") ? s : s.replace(/[^0-9]/g, "").slice(-10);
};

const getLockRemainingMs = (key) => {
    const e = loginFails.get(key);
    if (!e) return 0;
    if (e.until && e.until > Date.now()) return e.until - Date.now();
    loginFails.delete(key); // window expire ho chuki — fresh start
    return 0;
};

const recordLoginFail = (key) => {
    const now = Date.now();
    const e = loginFails.get(key);
    if (!e || (e.until && e.until <= now)) {
        loginFails.set(key, { count: 1, until: now + LOCKOUT_WINDOW_MS });
        return;
    }
    e.count += 1;
    if (e.count >= MAX_LOGIN_FAILS) e.until = now + LOCKOUT_WINDOW_MS; // lock fresh 15 min
};

const clearLoginFails = (key) => {
    loginFails.delete(key);
};

// Naya password rule: min 8 chars + kam se kam 1 letter + 1 number
const isStrongPassword = (pw) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(String(pw || ""));

// ── OTP helpers (MagicText — backend-owned 6-digit codes, Mongo me hashed) ────
const OTP_TTL_MIN = 5;        // code validity
const OTP_DOC_TTL_MIN = 15;   // doc life (rate-limit history ke liye)
const OTP_MAX_SENDS_15MIN = 5; // per-mobile send cap
const OTP_MAX_ATTEMPTS = 5;   // wrong-guess cap per code
const OTP_PURPOSES = ["register", "profile", "reset"];

const cleanMobile = (m) => String(m || "").replace(/[^0-9]/g, "").slice(-10);
const isValidMobile = (m) => /^[6-9]\d{9}$/.test(m);
const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");
const otpErr = (res, status, error, message) =>
    res.status(status).json({ success: false, error, message });

// ── Firebase se emailVerified sync karo → Mongo ─────────────────────────────
const syncEmailVerified = async (user) => {
    if (!user?.email) return user;
    try {
        const firebaseAdmin = getAdmin();
        if (!firebaseAdmin) return user;
        const fbUser = await firebaseAdmin.auth().getUserByEmail(user.email);
        const verified = !!fbUser.emailVerified;
        if (user.emailVerified !== verified) {
            user.emailVerified = verified;
            await user.save();
            console.log("emailVerified synced for:", user.email, "=", verified);
        }
    } catch (e) {
        console.error("emailVerified sync failed for:", user.email, e.message);
    }
    return user;
};

// ── 1a. Send OTP (MagicText SMS) ─────────────────────────────────────────────
const sendOtp = async (req, res) => {
    try {
        const mobile = cleanMobile(req.body.mobile);
        const purpose = OTP_PURPOSES.includes(req.body.purpose) ? req.body.purpose : "profile";
        const lang = req.body.lang === "mr" ? "mr" : "en";
        if (!isValidMobile(mobile))
            return otpErr(res, 400, "invalid_phone", "Enter a valid 10-digit mobile number");

        // Per-phone rate limit: max 5 sends / 15 min
        const since = new Date(Date.now() - OTP_DOC_TTL_MIN * 60 * 1000);
        const sends = await OtpCode.countDocuments({ mobile, createdAt: { $gte: since } });
        if (sends >= OTP_MAX_SENDS_15MIN)
            return otpErr(res, 429, "rate_limited", "Too many OTP requests. Please try again after some time.");

        // Purani active codes invalidate — sirf latest code chalega
        await OtpCode.updateMany({ mobile, consumedAt: null }, { $set: { consumedAt: new Date() } });

        const otp = String(crypto.randomInt(100000, 1000000));
        const now = Date.now();
        await OtpCode.create({
            mobile,
            purpose,
            codeHash: sha256(otp),
            validUntil: new Date(now + OTP_TTL_MIN * 60000),
            expiresAt: new Date(now + OTP_DOC_TTL_MIN * 60000),
        });

        try {
            await sendOtpSms(mobile, otp, lang);
        } catch (e) {
            console.error("OTP SMS failed:", e.message);
            return otpErr(res, 502, "sms_failed", "Could not send OTP. Please try again.");
        }

        res.json({ success: true, message: "OTP sent", expiresIn: OTP_TTL_MIN * 60 });
    } catch (err) {
        console.error("OTP send error:", err.message);
        otpErr(res, 500, "sms_failed", "Could not send OTP. Please try again.");
    }
};

// ── 1b. Verify OTP (MagicText) — purpose ke hisaab se response ───────────────
const verifyOtp = async (req, res) => {
    try {
        const mobile = cleanMobile(req.body.mobile);
        const purpose = OTP_PURPOSES.includes(req.body.purpose) ? req.body.purpose : "profile";
        const otp = String(req.body.otp || "").trim();
        const { name } = req.body;

        if (!isValidMobile(mobile))
            return otpErr(res, 400, "invalid_phone", "Enter a valid 10-digit mobile number");
        if (!/^\d{6}$/.test(otp))
            return otpErr(res, 400, "invalid_code", "Enter the 6-digit OTP");

        const rec = await OtpCode.findOne({ mobile, purpose, consumedAt: null }).sort({ createdAt: -1 });
        if (!rec)
            return otpErr(res, 400, "expired", "OTP not found. Please request a new one.");
        if (rec.validUntil < new Date())
            return otpErr(res, 400, "expired", "OTP expired. Please request a new one.");
        if (rec.attempts >= OTP_MAX_ATTEMPTS)
            return otpErr(res, 429, "rate_limited", "Too many wrong attempts. Please request a new OTP.");

        if (sha256(otp) !== rec.codeHash) {
            rec.attempts += 1;
            await rec.save();
            return otpErr(res, 400, "invalid_code", "Incorrect OTP. Please check the SMS and try again.");
        }

        rec.consumedAt = new Date();
        await rec.save();

        // ── Purpose: register → short-lived token (registerEmail me prove hoga) ──
        if (purpose === "register") {
            const otpToken = jwt.sign({ mobile, purpose: "register" }, process.env.JWT_SECRET, { expiresIn: "15m" });
            return res.json({ success: true, otpToken });
        }

        // ── Purpose: reset → short-lived token (resetPasswordMobile me prove) ────
        if (purpose === "reset") {
            const resetToken = jwt.sign({ mobile, purpose: "reset" }, process.env.JWT_SECRET, { expiresIn: "10m" });
            return res.json({ success: true, resetToken });
        }

        // ── Purpose: profile → mobile link + JWT (Section1 flow) ────────────────
        const mobileNumber = `+91${mobile}`;

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
            // Logged-in user → usi mein mobile update karo (conflict check)
            const mobileConflict = await User.findOne({
                mobile: mobileNumber,
                _id: { $ne: loggedInUser._id },
            });
            if (mobileConflict) {
                return otpErr(res, 400, "mobile_linked_other", "This mobile number is linked to another account");
            }
            loggedInUser.mobile = mobileNumber;
            loggedInUser.isVerified = true;
            if (name) loggedInUser.name = name;
            await loggedInUser.save();
            user = loggedInUser;
        } else {
            // Koi logged-in nahi → mobile se dhoondo ya naya user banao
            user = await User.findOne({ mobile: { $in: [mobileNumber, mobile, `91${mobile}`] } });
            if (!user) {
                user = await User.create({ mobile: mobileNumber, name: name || "", isVerified: true });
            } else {
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
                emailVerified: !!user.emailVerified,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("OTP verify error:", err.message);
        otpErr(res, 400, "verify_failed", "OTP verification failed. Please try again.");
    }
};

// ── 2. Email Register ─────────────────────────────────────────────────────────
const registerEmail = async (req, res) => {
    try {
        const { email, password, mobile, name, firebaseUid, otpToken } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail)
            return res.status(400).json({ success: false, message: "Email already registered" });

        if (mobile) {
            const cleanMobileNum = cleanMobile(mobile);
            if (!isValidMobile(cleanMobileNum))
                return otpErr(res, 400, "invalid_phone", "Enter a valid 10-digit mobile number");

            // Mobile OTP (MagicText) se verify hona chahiye — koi bypass nahi
            if (otpToken) {
                try {
                    const d = jwt.verify(otpToken, process.env.JWT_SECRET);
                    if (d.purpose !== "register" || cleanMobile(d.mobile) !== cleanMobileNum) throw new Error("mismatch");
                } catch (_) {
                    return otpErr(res, 400, "session_expired", "OTP session expired. Please verify your mobile again.");
                }
            } else {
                return otpErr(res, 400, "otp_required", "Please verify your mobile number with OTP");
            }

            const mobileFormats = [
                `+91${cleanMobileNum}`,
                cleanMobileNum,
                `91${cleanMobileNum}`,
            ];
            const existingMobile = await User.findOne({
                mobile: { $in: mobileFormats },
            });
            if (existingMobile && existingMobile.firebaseUid !== firebaseUid) {
                return res.status(400).json({
                    success: false,
                    message: "This mobile number is already registered. Please use a different number or login with existing account.",
                });
            }
        }

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
                isVerified: !!firebaseUid || !!otpToken,
                role: "user",
            });
            await user.save();
        }

        res.json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, firebaseUid: user.firebaseUid, emailVerified: !!user.emailVerified, role: user.role },
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

        // ── Brute-force lock check (5 wrong tries → 15 min) ──
        const lockKey = lockKeyOf(loginId);
        const lockMs = getLockRemainingMs(lockKey);
        if (lockMs > 0) {
            const waitMin = Math.ceil(lockMs / 60000);
            return res.status(429).json({
                message: `Too many failed attempts. Please try again in ${waitMin} minute(s).`,
                retryAfterMinutes: waitMin,
            });
        }

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

        console.log("Login - identifier:", loginId, "isEmail:", isEmail, "found:", !!user, "userMobile:", user?.mobile, "hasEmail:", !!user?.email, "hasPassword:", !!user?.password);
        if (!user) {
            recordLoginFail(lockKey);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Firebase token verification — only for email login
        if (firebaseIdToken && isEmail) {
            try {
                const firebaseAdmin = getAdmin();
                if (firebaseAdmin) {
                    const decoded = await firebaseAdmin.auth().verifyIdToken(firebaseIdToken);
                    const emailMatch = decoded.email && decoded.email === loginId.toLowerCase();
                    const uidMatch = user.firebaseUid && decoded.uid === user.firebaseUid;
                    if (!emailMatch && !uidMatch) {
                        recordLoginFail(lockKey);
                        return res.status(401).json({ message: "Invalid credentials" });
                    }
                    // ⚠️ Login pe Mongo password KABHI mat likho — sirf reset flows update karte hain
                    // Firebase idToken se emailVerified sync (decoded.email_verified)
                    try {
                        if (decoded.email_verified !== undefined && user.emailVerified !== !!decoded.email_verified) {
                            user.emailVerified = !!decoded.email_verified;
                            await user.save();
                        }
                    } catch (_) {}
                    clearLoginFails(lockKey);
                    return res.json({
                        success: true,
                        token: generateToken(user._id),
                        user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, firebaseUid: user.firebaseUid, emailVerified: !!user.emailVerified, role: user.role },
                    });
                }
            } catch (e) {
                console.error("Firebase token verify failed:", e.message);
            }
        }

        // Mongo hash match (agar password field hi nahi toh Firebase fallback pe jao)
        // ⚠️ Fallback success = Firebase (source of truth) → Mongo one-way heal
        //    Ye SAFE hai: client password Firebase ne already verify kiya
        let isMatch = false;
        if (user.password) {
            isMatch = await user.matchPassword(password);
        }
        // Mongo hash match hone pe bhi emailVerified sync karo (Firebase source of truth)
        if (isMatch) {
            await syncEmailVerified(user);
        }
        if (!isMatch) {
            // Firebase fallback: verify password via Firebase REST API
            // (covers email-reset / mobile-reset users where Mongo hash is stale)
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
                        // Password correct according to Firebase → re-hash and save locally (heal)
                        user.password = password;
                        // Firebase REST response me idToken aata hai — usse emailVerified sync
                        try {
                            if (resp.idToken) {
                                const fbAdmin = getAdmin();
                                if (fbAdmin) {
                                    const dec = await fbAdmin.auth().verifyIdToken(resp.idToken);
                                    if (dec.email_verified !== undefined && user.emailVerified !== !!dec.email_verified) {
                                        user.emailVerified = !!dec.email_verified;
                                    }
                                }
                            }
                        } catch (_) {}
                        await user.save();
                        console.log("Password re-hashed from Firebase for:", user.email);
                        clearLoginFails(lockKey);
                        return res.json({
                            success: true,
                            token: generateToken(user._id),
                            user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, firebaseUid: user.firebaseUid, emailVerified: !!user.emailVerified, role: user.role },
                        });
                    } else {
                        console.log("Firebase REST fallback rejected for:", user.email, "status:", resp.status);
                    }
                } catch (e) {
                    console.error("Firebase REST fallback error:", e.message);
                }
            } else {
                console.log("Firebase REST fallback skipped:", { hasKey: !!fbKey, hasEmail: !!user.email });
            }
            recordLoginFail(lockKey);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        clearLoginFails(lockKey);
        res.json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, firebaseUid: user.firebaseUid, emailVerified: !!user.emailVerified, role: user.role },
        });
    } catch (err) {
        console.error("Login error:", err.message);
        console.error("Login stack:", err.stack);
        console.error("Login context:", JSON.stringify({ identifier: req.body?.identifier, hasPassword: !!req.body?.password, hasFirebaseToken: !!req.body?.firebaseIdToken }));
        res.status(500).json({ message: "Login failed" });
    }
};

// ── 4. Get current user ───────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        await syncEmailVerified(user);
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                firebaseUid: user.firebaseUid,
                emailVerified: !!user.emailVerified,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        console.error("Get me error:", err.message);
        res.status(500).json({ message: "Fetch failed" });
    }
};

// ── 5. Reset password via mobile OTP ─────────────────────────────────────────
// Naya flow: MagicText OTP → /otp/verify (purpose=reset) → resetToken
// Legacy: Firebase ID token (purane clients ke liye fallback)
const resetPasswordMobile = async (req, res) => {
    try {
        const { idToken, resetToken, newPassword } = req.body;
        if (!newPassword) {
            return res.status(400).json({ success: false, message: "New password required" });
        }

        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include a letter and a number" });
        }

        if (!idToken && !resetToken) {
            return otpErr(res, 400, "session_expired", "Session expired. Please verify OTP again.");
        }

        const firebaseAdmin = getAdmin();

        let uid = null;
        let phone_number = null;

        if (resetToken) {
            try {
                const d = jwt.verify(resetToken, process.env.JWT_SECRET);
                if (d.purpose !== "reset") throw new Error("bad purpose");
                phone_number = `+91${cleanMobile(d.mobile)}`;
            } catch (_) {
                return otpErr(res, 400, "session_expired", "Reset session expired. Please verify OTP again.");
            }
        } else {
            if (!firebaseAdmin) {
                return res.status(500).json({ message: "Firebase not configured on server" });
            }
            const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
            uid = decoded.uid;
            phone_number = decoded.phone_number;
        }

        // Find user by firebaseUid or mobile
        let user = null;
        if (uid) user = await User.findOne({ firebaseUid: uid });
        if (!user && phone_number) {
            const clean = phone_number.replace(/[^0-9]/g, "").slice(-10);
            user = await User.findOne({
                $or: [
                    { mobile: phone_number },
                    { mobile: `+91${clean}` },
                    { mobile: clean },
                ],
            });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "Account doesn't exist. Please register first." });
        }

        // Check same password
        if (user.password) {
            const bcrypt = require("bcryptjs");
            const isSame = await bcrypt.compare(newPassword, user.password);
            if (isSame) {
                return res.status(400).json({ success: false, message: "Same password" });
            }
        }

        // Update password (pre-save hook will hash it)
        // Order: pehle Firebase (email account critical), phir Mongo
        // Email wala Firebase user alag UID ho sakta hai (phone auth vs email/password)

        let firebaseUpdated = false;
        let firebaseSkipReason = null;

        const updateFbUid = async (uidToUse, label) => {
            if (!firebaseAdmin || !uidToUse) return false;
            try {
                await firebaseAdmin.auth().updateUser(uidToUse, { password: newPassword });
                console.log(`Firebase Auth password updated (${label}):`, uidToUse);
                return true;
            } catch (e) {
                console.error(`Firebase Auth password update failed (${label}, ${uidToUse}):`, e.message);
                return false;
            }
        };

        // 1) Email account — email login isliye ye mandatory hai
        if (firebaseAdmin && user.email) {
            try {
                const fbByEmail = await firebaseAdmin.auth().getUserByEmail(user.email);
                const ok = await updateFbUid(fbByEmail.uid, "email");
                if (ok) firebaseUpdated = true;
                else firebaseSkipReason = firebaseSkipReason || "email_update_failed";

                // 2) user.firebaseUid alag ho toh usse bhi update (phone-linked doc)
                if (user.firebaseUid && user.firebaseUid !== fbByEmail.uid) {
                    const ok2 = await updateFbUid(user.firebaseUid, "firebaseUid");
                    if (ok2) firebaseUpdated = true;
                }
            } catch (e) {
                console.error("Firebase getUserByEmail failed:", e.message);
                firebaseSkipReason = firebaseSkipReason || `getUserByEmail: ${e.message}`;
                // fallback: firebaseUid se try
                if (user.firebaseUid) {
                    const ok = await updateFbUid(user.firebaseUid, "firebaseUid-fallback");
                    if (ok) firebaseUpdated = true;
                }
            }
        } else if (firebaseAdmin && user.firebaseUid) {
            const ok = await updateFbUid(user.firebaseUid, "firebaseUid");
            if (ok) firebaseUpdated = true;
            else firebaseSkipReason = "firebaseUid_update_failed";
        }

        // 3) Phone number wala Firebase user (alag UID ho toh)
        if (firebaseAdmin && phone_number) {
            try {
                const fbByPhone = await firebaseAdmin.auth().getUserByPhoneNumber(phone_number);
                if (!user.firebaseUid || fbByPhone.uid !== user.firebaseUid) {
                    const ok = await updateFbUid(fbByPhone.uid, "phone");
                    if (ok) firebaseUpdated = true;
                }
            } catch (e) {
                // phone user nahi mila — ignore
                if (!firebaseSkipReason) firebaseSkipReason = `phone: ${e.message}`;
            }
        }

        // Mongo save (pre-save hook hashes)
        user.password = newPassword;
        await user.save();
        console.log("Mongo password updated for mobile reset:", user._id, "firebaseUpdated:", firebaseUpdated, firebaseSkipReason || "");

        // Email account exist karta hai par update fail → partial success flag
        // (client ko success dikhate hain taaki mobile login chalu rahe;
        //  log me clear reason Railway pe dikhega)
        res.json({
            success: true,
            message: "Password reset successful",
            firebaseUpdated,
            ...(firebaseUpdated ? {} : { firebaseSkipReason: firebaseSkipReason || "no_firebase_account" }),
        });
    } catch (err) {
        console.error("Reset password mobile error:", err.message);
        res.status(500).json({ message: "Password reset failed" });
    }
};

// ── 5. Email reset ke baad MongoDB password sync ─────────────────────────────
// Client: confirmPasswordReset → signInWithEmailAndPassword → idToken lekar yahan bhejta hai
// idToken prove karta hai ki user Firebase me naye password se authenticate ho paya
const resetPasswordEmail = async (req, res) => {
    try {
        const { idToken, newPassword } = req.body;
        if (!idToken || !newPassword) {
            return res.status(400).json({ success: false, message: "ID token and new password required" });
        }
        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include a letter and a number" });
        }

        const firebaseAdmin = getAdmin();
        if (!firebaseAdmin) {
            return res.status(500).json({ message: "Firebase not configured on server" });
        }

        const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
        const { uid, email } = decoded;
        const loginEmailDecoded = (email || "").toLowerCase();

        // Find user by email / firebaseUid
        let user = null;
        if (loginEmailDecoded) user = await User.findOne({ email: loginEmailDecoded });
        if (!user && uid) user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            // Mongo me nahi hai → kuch sync nahi (firebase_only); success maano
            return res.json({ success: true, message: "Password reset successful", synced: false });
        }

        // Same password guard (Mongo hash se)
        if (user.password) {
            const bcrypt = require("bcryptjs");
            const isSame = await bcrypt.compare(newPassword, user.password);
            if (isSame) {
                return res.status(400).json({ success: false, message: "Same password" });
            }
        }

        user.password = newPassword;
        await user.save();
        console.log("Mongo password synced after email reset for:", user.email || user._id);

        res.json({ success: true, message: "Password reset successful", synced: true });
    } catch (err) {
        console.error("Reset password email sync error:", err.message);
        res.status(500).json({ message: "Password reset failed" });
    }
};

module.exports = { sendOtp, verifyOtp, registerEmail, loginEmail, getMe, resetPasswordMobile, resetPasswordEmail };