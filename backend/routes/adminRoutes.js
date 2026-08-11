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
    getEditRequests,
    updateEditRequest,
    updateEditAllowed,
    deleteUser,
} = require("../controllers/adminController");

const { exportFormPdf, exportFormDocx } = require("../controllers/exportController");

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:userId", protect, adminOnly, getUserDetail);
router.put("/users/:userId/status", protect, adminOnly, updateUserStatus);
router.put("/users/:userId/edit-allow", protect, adminOnly, updateEditAllowed);
router.delete("/users/:userId", protect, adminOnly, deleteUser);
router.get("/users/:userId/export/pdf", protect, adminOnly, exportFormPdf);
router.get("/users/:userId/export/docx", protect, adminOnly, exportFormDocx);
router.get("/docs/:fileId", protect, adminOnly, getDocument);
router.get("/export/excel", protect, adminOnly, exportExcel);
router.get("/edit-requests", protect, adminOnly, getEditRequests);
router.put("/edit-requests/:id", protect, adminOnly, updateEditRequest);

module.exports = router;