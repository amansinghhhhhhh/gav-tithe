const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ── 1. Helmet — HTTP security headers ────────────────────────────────────────
app.use(helmet());

// ✅ Railway/Vercel proxy trust karo
app.set("trust proxy", 1);

// ── 2. CORS — sirf allowed origins ───────────────────────────────────────────
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://user.gaontitheudyojak.com",
    "https://admin.gaontitheudyojak.com",
    // Naya Vercel URL aane pe yahan add karo
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Vary", "Origin");
    }
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

// ── 3. Rate Limiting ──────────────────────────────────────────────────────────
// General API limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requests per 15 min
    message: { message: "Too many requests, please try again later" },
});

// Auth routes ke liye strict limit
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per 15 min
    message: { message: "Too many login attempts, please try again later" },
});

// ── 4. Body Parser ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── 5. MongoDB Injection Sanitize ─────────────────────────────────────────────
app.use(mongoSanitize());

// ── 6. Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/form", apiLimiter, require("./routes/formRoutes"));
app.use("/api/admin", apiLimiter, require("./routes/adminRoutes"));

// ── 7. Health check ───────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Gav Tithe API running ✅" }));

// ── 8. Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    res.status(err.status || 500).json({
        message: err.status ? err.message : "Internal server error",
    });
});

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        app.listen(PORT, () => console.log(`✅ Server running (without DB) on http://localhost:${PORT}`));
    });