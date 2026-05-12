const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const {
    getAllUsers,
    getUserDetail,
    updateUserStatus,
    getDocument,
} = require("../controllers/adminController");

// GET  /api/admin/users          ← All users list
// GET  /api/admin/users/:userId  ← Single user detail
// PUT  /api/admin/users/:userId/status ← Approve/Reject
// GET  /api/admin/docs/:fileId   ← View document

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:userId", protect, adminOnly, getUserDetail);
router.put("/users/:userId/status", protect, adminOnly, updateUserStatus);
router.get("/docs/:fileId", protect, adminOnly, getDocument);

module.exports = router;