const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://user.localhost:5173",
    "http://admin.localhost:5174",
    "https://gav-tithe-liart.vercel.app",  // ✅ Vercel URL
    // Sare vercel subdomains allow karo
    /https:\/\/.*\.vercel\.app$/,
];

app.use(cors({
    origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        // String match
        if (allowedOrigins.some(o =>
            typeof o === "string" ? o === origin : o.test(origin)
        )) return cb(null, true);
        cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/form", require("./routes/formRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "Gav Tithe API running ✅" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));