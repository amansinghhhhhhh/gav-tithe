const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ✅ CORS — sab allow karo
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/form", require("./routes/formRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "Gav Tithe API running ✅" }));

const PORT = process.env.PORT || 5000;

// MongoDB connect karo — error pe crash mat karo
connectDB()
    .then(() => {
        app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        // Server phir bhi start karo
        app.listen(PORT, () => console.log(`✅ Server running (without DB) on http://localhost:${PORT}`));
    });