const express = require("express");
const router = express.Router();
const {
  getDRPEntries,
  getSectors,
  getDistricts,
  seedDRPEntries,
} = require("../controllers/drpController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getDRPEntries);
router.get("/sectors", getSectors);
router.get("/districts", getDistricts);
router.post("/seed", protect, adminOnly, seedDRPEntries);

module.exports = router;
