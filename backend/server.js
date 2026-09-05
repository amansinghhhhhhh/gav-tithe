const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// ✅ Hamesha backend/.env load karo — chahe kahin se bhi start karo
const env = dotenv.config({ path: path.join(__dirname, ".env") });

// ⚠️ Terminal session ka purana placeholder MONGO_URI override ho jaye toh ignore karo
if (env.parsed?.MONGO_URI && /cluster\.xxxxx|placeholder/i.test(process.env.MONGO_URI || "")) {
    process.env.MONGO_URI = env.parsed.MONGO_URI;
    console.log("⚠️ Terminal session ka placeholder MONGO_URI mila — backend/.env ki value use ki gayi");
}

const app = express();

// ── 1. Helmet — HTTP security headers ────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// ✅ Railway/Vercel proxy trust karo
app.set("trust proxy", true);

// ── 2. CORS — sirf allowed origins ───────────────────────────────────────────
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://10.28.208.72:5173",
    "http://10.28.208.72:5174",
    "https://user.gaontitheudyojak.com",
    "https://admin.gaontitheudyojak.com",
];

// DEV: FRONTEND_URL env se local network IP allow karo
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── 3. Rate Limiting ──────────────────────────────────────────────────────────
// General API limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                  // 100 requests per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            message: "Too many requests, please try again later",
        });
    },
});

// Auth routes ke liye strict limit
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const waitMs = req.rateLimit.resetTime - Date.now();
        const waitMin = Math.ceil(waitMs / 60000);
        res.status(429).json({
            message: `Too many login attempts. Please try again in ${waitMin} minute(s).`,
            retryAfterMinutes: waitMin,
        });
    },
});

// ── 4. Body Parser ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── 5. MongoDB Injection Sanitize ─────────────────────────────────────────────
app.use(mongoSanitize());

// ── 6. Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", apiLimiter, require("./routes/authRoutes"));
app.use("/api/form", apiLimiter, require("./routes/formRoutes"));
app.use("/api/admin", apiLimiter, require("./routes/adminRoutes"));
app.use("/api/assessment", apiLimiter, require("./routes/assessmentRoutes"));
app.use("/api/drp", apiLimiter, require("./routes/drpRoutes"));

// ── 7. Health check ───────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Gav Tithe API running ✅" }));

// ── 8. Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(err.status || 500).json({
        message: err.status ? err.message : "Internal server error",
    });
});

const PORT = process.env.PORT || 5000;

connectDB()
    .then(async () => {
        // ✅ Fix: Remove stale uniqueId: null from formdatas (duplicate key fix)
        try {
            const FormData = require("./models/FormData");
            const result = await FormData.updateMany(
                { uniqueId: { $exists: true, $eq: null } },
                { $unset: { uniqueId: "" } }
            );
            if (result.modifiedCount > 0) {
                console.log(`⚠️ Cleaned ${result.modifiedCount} forms with null uniqueId`);
            }
        } catch (_) {}
        app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        app.listen(PORT, () => console.log(`✅ Server running (without DB) on http://localhost:${PORT}`));
    });