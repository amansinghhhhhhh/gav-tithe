const express = require("express");
const router = express.Router();
const {
    sevaUpload, handleSevaMulterError,
    submitSeva, getMySevaApps, getMySevaDocument,
    adminListSeva, adminGetSeva, adminUpdateSevaStatus, adminGetSevaFile,
} = require("../controllers/sevaController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ── User ──────────────────────────────────────────────────────────────────────
router.get("/mine", protect, getMySevaApps);
router.get("/docs/:fileId", protect, getMySevaDocument);

router.post(
    "/submit",
    protect,
    sevaUpload.fields([
        { name: "ppt", maxCount: 1 },
        { name: "idProof", maxCount: 1 },
        { name: "prototype", maxCount: 1 },
        { name: "research", maxCount: 1 },
    ]),
    handleSevaMulterError,
    submitSeva
);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/admin/list", protect, adminOnly, adminListSeva);
router.get("/admin/file/:fileId", protect, adminOnly, adminGetSevaFile);
router.get("/admin/:id", protect, adminOnly, adminGetSeva);
router.patch("/admin/:id/status", protect, adminOnly, adminUpdateSevaStatus);

module.exports = router;
