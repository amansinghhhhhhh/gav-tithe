const { body, validationResult } = require("express-validator");

// ── Validation result check karo ──────────────────────────────────────────────
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array().map((e) => ({
                field: e.path,
                message: e.msg,
            })),
        });
    }
    next();
};

// ── Auth Validators ───────────────────────────────────────────────────────────

// OTP verify
const validateOtp = [
    body("idToken")
        .notEmpty().withMessage("Firebase ID token required"),
    body("mobile")
        .optional()
        .isMobilePhone("en-IN").withMessage("Valid 10-digit mobile number daalo"),
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage("Naam 2-100 characters ka hona chahiye"),
    validate,
];

// Email Register
const validateRegister = [
    body("email")
        .isEmail()
        .withMessage("Valid email daalo"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password min 6 chars hona chahiye"),

    body("name")
        .optional()
        .trim(),

    // ✅ mobile completely optional — no validation
    body("mobile")
        .optional({ nullable: true, checkFalsy: true }),

    validate,
];

// Email / Mobile Login
const validateLogin = [
    body("password")
        .notEmpty().withMessage("Password required"),
    body()
        .custom((_, { req }) => {
            if (!req.body.identifier && !req.body.email) {
                throw new Error("Email ya mobile number required");
            }
            return true;
        }),
    validate,
];

// ── Form Validators ───────────────────────────────────────────────────────────

// Save section
const validateSaveSection = [
    body("section")
        .notEmpty().withMessage("Section name required")
        .isIn(["section1", "section2", "section3", "section4"])
        .withMessage("Invalid section name"),
    body("data")
        .notEmpty().withMessage("Section data required")
        .isObject().withMessage("Data object hona chahiye"),
    validate,
];

// Submit form
const validateSubmitForm = [
    body("section1").optional().isObject().withMessage("Section1 object hona chahiye"),
    body("section2").optional().isObject().withMessage("Section2 object hona chahiye"),
    body("section3").optional().isObject().withMessage("Section3 object hona chahiye"),
    body("section4").optional().isObject().withMessage("Section4 object hona chahiye"),
    validate,
];

module.exports = {
    validateOtp,
    validateRegister,
    validateLogin,
    validateSaveSection,
    validateSubmitForm,
};