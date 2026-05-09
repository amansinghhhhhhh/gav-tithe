const admin = require("firebase-admin");

const getAdmin = () => {
    if (admin.apps.length) return admin;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    console.log("🔥 Firebase init check:");
    console.log("  PROJECT_ID:", projectId || "❌ MISSING");
    console.log("  CLIENT_EMAIL:", clientEmail || "❌ MISSING");
    console.log("  PRIVATE_KEY:", privateKey ? "✅ EXISTS" : "❌ MISSING");

    if (!projectId || !clientEmail || !privateKey) {
        console.warn("⚠️ Firebase not initialized — OTP will not work");
        return null;
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        console.log("✅ Firebase initialized successfully");
        return admin;
    } catch (err) {
        console.error("❌ Firebase init error:", err.message);
        return null;
    }
};

module.exports = { getAdmin };