const mongoose = require("mongoose");

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }

    // Placeholder URI detect karo (e.g. cluster.xxxxx.mongodb.net) — fail fast
    if (/cluster\.xxxxx|placeholder/i.test(uri)) {
        throw new Error(
            "MONGO_URI me placeholder hai (cluster.xxxxx). Backend/.env me sahi MongoDB URI set karo. " +
            "Agar terminal me $env:MONGO_URI set kiya hai to 'Remove-Item Env:MONGO_URI' chalao."
        );
    }

    console.log("🔄 Connecting to MongoDB...");
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;