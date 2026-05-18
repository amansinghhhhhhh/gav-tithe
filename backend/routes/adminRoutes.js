const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const {
    getAllUsers,
    getUserDetail,
    updateUserStatus,
    getDocument,
    exportExcel,
} = require("../controllers/adminController");

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:userId", protect, adminOnly, getUserDetail);
router.put("/users/:userId/status", protect, adminOnly, updateUserStatus);
router.get("/docs/:fileId", protect, adminOnly, getDocument);
router.get("/export/excel", protect, adminOnly, exportExcel);

module.exports = router;