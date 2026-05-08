const admin = require("firebase-admin");

// Lazy initialize — server crash nahi hoga missing vars pe
const getAdmin = () => {
    if (admin.apps.length) return admin;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        console.warn("⚠️ Firebase env variables missing — OTP will not work");
        return null;
    }

    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });

    console.log("✅ Firebase initialized");
    return admin;
};

module.exports = { getAdmin };