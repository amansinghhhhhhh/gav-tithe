const express2 = require("express");
const router2 = express2.Router();
const { saveSection, submitForm, getMyForm, uploadDoc } = require("../controllers/formController");
const { protect: protect2 } = require("../middleware/authMiddleware");
const { upload, verifyMagicBytes, verifyMagicBytesFields, handleMulterError } = require("../middleware/upload");
const { validateSaveSection } = require("../middleware/validate");

router2.get("/", protect2, getMyForm);

router2.post("/save", protect2, validateSaveSection, saveSection);

router2.post(
    "/submit",
    protect2,
    upload.fields([
        { name: "doc_aadhaar_front", maxCount: 1 },
        { name: "doc_aadhaar_back", maxCount: 1 },
        { name: "doc_pan", maxCount: 1 },
        { name: "doc_udyam", maxCount: 1 },
        { name: "doc_passport", maxCount: 1 },
    ]),
    verifyMagicBytesFields,
    handleMulterError,
    submitForm
);

router2.post("/upload/:docType", protect2, upload.single("file"), verifyMagicBytes, handleMulterError, uploadDoc);

module.exports = router2;