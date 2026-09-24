const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getAdmin } = require("../config/firebase");

const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

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
                // ── Agar mobile se mila hai aur firebaseUid alag hai → duplicate mobile
                if (user.mobile === mobileNumber && user.firebaseUid && user.firebaseUid !== uid) {
                    return res.status(400).json({
                        success: false,
                        message: "This mobile number is already registered. Please use a different number or login with existing account.",
                    });
                }
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
                emailVerified: !!user.emailVerified,
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

        if (mobile) {
            const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(-10);
            const mobileFormats = [
                `+91${cleanMobile}`,
                cleanMobile,
                `91${cleanMobile}`,
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
                isVerified: !!firebaseUid,
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
                    // ⚠️ Login pe Mongo password KABHI mat likho — sirf reset flows update karte hain
                    // Firebase idToken se emailVerified sync (decoded.email_verified)
                    try {
                        if (decoded.email_verified !== undefined && user.emailVerified !== !!decoded.email_verified) {
                            user.emailVerified = !!decoded.email_verified;
                            await user.save();
                        }
                    } catch (_) {}
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
            return res.status(401).json({ message: "Invalid credentials" });
        }

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
        },
    });
};

// ── 5. Reset password via mobile OTP (Firebase ID token verification) ─────────
const resetPasswordMobile = async (req, res) => {
    try {
        const { idToken, newPassword } = req.body;
        if (!idToken || !newPassword) {
            return res.status(400).json({ success: false, message: "ID token and new password required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const firebaseAdmin = getAdmin();
        if (!firebaseAdmin) {
            return res.status(500).json({ message: "Firebase not configured on server" });
        }

        // Verify Firebase ID token
        const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
        const { uid, phone_number } = decoded;

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
            if (!uidToUse) return false;
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
        if (user.email) {
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
        } else if (user.firebaseUid) {
            const ok = await updateFbUid(user.firebaseUid, "firebaseUid");
            if (ok) firebaseUpdated = true;
            else firebaseSkipReason = "firebaseUid_update_failed";
        }

        // 3) Phone number wala Firebase user (alag UID ho toh)
        if (phone_number) {
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
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
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

module.exports = { verifyOtp, registerEmail, loginEmail, getMe, resetPasswordMobile, resetPasswordEmail };