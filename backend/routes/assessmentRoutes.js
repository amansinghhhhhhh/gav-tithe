const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getMyAssessment, saveAnswer, completeAssessment, retakeAssessment } = require("../controllers/assessmentController");

router.get("/", protect, getMyAssessment);
router.post("/answer", protect, saveAnswer);
router.post("/complete", protect, completeAssessment);
router.post("/retake", protect, retakeAssessment);

module.exports = router;
