const express = require("express");
const router = express.Router();
const {
  getDRPEntries,
  getSectors,
  getDistricts,
  seedDRPEntries,
  adminGetAll,
  adminGetOne,
  adminCreate,
  adminUpdate,
  adminDelete,
} = require("../controllers/drpController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getDRPEntries);
router.get("/sectors", getSectors);
router.get("/districts", getDistricts);

// Admin routes
router.get("/admin/all", protect, adminOnly, adminGetAll);
router.get("/admin/:id", protect, adminOnly, adminGetOne);
router.post("/admin", protect, adminOnly, adminCreate);
router.put("/admin/:id", protect, adminOnly, adminUpdate);
router.delete("/admin/:id", protect, adminOnly, adminDelete);
router.post("/seed", protect, adminOnly, seedDRPEntries);

module.exports = router;
