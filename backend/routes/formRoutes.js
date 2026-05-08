
// ─── formRoutes.js ────────────────────────────────────────────────────────────
const express2 = require("express");
const router2 = express2.Router();
const { saveSection, submitForm, getMyForm, uploadDoc } = require("../controllers/formController");
const { protect: protect2 } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");

router2.get("/", protect2, getMyForm);   // GET  /api/form
router2.post("/save", protect2, saveSection); // POST /api/form/save
router2.post("/submit", protect2, submitForm);  // POST /api/form/submit
router2.post("/upload/:docType", protect2, upload.single("file"), uploadDoc);  // POST /api/form/upload/aadhaar

module.exports = router2;