const admin = require("firebase-admin");

if (!admin.apps.length) {
    // Debug — Railway mein kya values aa rahi hain
    console.log("🔥 Firebase config check:");
    console.log("PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
    console.log("CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
    console.log("PRIVATE_KEY exists:", !!process.env.FIREBASE_PRIVATE_KEY);

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        console.error("❌ Firebase env variables missing!");
        console.error({ projectId, clientEmail, privateKey: !!privateKey });
        process.exit(1);
    }

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });

    console.log("✅ Firebase initialized successfully");
}

module.exports = admin;