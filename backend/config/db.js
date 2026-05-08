const mongoose = require("mongoose");

const connectDB = async () => {
    console.log("🔍 MONGO_URI:", process.env.MONGO_URI ? "EXISTS" : "UNDEFINED");
    console.log("🔍 All env keys:", Object.keys(process.env).filter(k => !k.includes("npm") && !k.includes("NODE")));

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ MongoDB Error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;