const express2 = require("express");
const router2 = express2.Router();
const { saveSection, submitForm, getMyForm, uploadDoc } = require("../controllers/formController");
const { protect: protect2 } = require("../middleware/authMiddleware");
const { upload, verifyMagicBytes, handleMulterError } = require("../middleware/upload");
const { validateSaveSection } = require("../middleware/validate");

router2.get("/", protect2, getMyForm);

router2.post("/save", protect2, validateSaveSection, saveSection);

router2.post("/submit", protect2, submitForm);

router2.post("/upload/:docType", protect2, upload.single("file"), verifyMagicBytes, handleMulterError, uploadDoc);

module.exports = router2;