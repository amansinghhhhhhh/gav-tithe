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

// OTP verify (MagicText — mobile + 6-digit code + purpose)
const validateOtp = [
    body("mobile")
        .notEmpty().withMessage("Mobile number required")
        .isMobilePhone("en-IN").withMessage("Valid 10-digit mobile number required"),
    body("otp")
        .matches(/^\d{6}$/).withMessage("6-digit OTP required"),
    body("purpose")
        .optional()
        .isIn(["register", "profile", "reset"]).withMessage("Invalid purpose"),
    body("name")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
    validate,
];

// Email Register
const validateRegister = [
    body("email")
        .isEmail()
        .withMessage("Enter a valid email"),

    body("password")
        .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
        .withMessage("Password must be at least 8 characters and include a letter and a number"),

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
                throw new Error("Email or mobile number required");
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
        .isObject().withMessage("Data must be an object"),
    validate,
];

// Submit form
const validateSubmitForm = [
    body("section1").optional().isObject().withMessage("Section1 must be an object"),
    body("section2").optional().isObject().withMessage("Section2 must be an object"),
    body("section3").optional().isObject().withMessage("Section3 must be an object"),
    body("section4").optional().isObject().withMessage("Section4 must be an object"),
    validate,
];

module.exports = {
    validateOtp,
    validateRegister,
    validateLogin,
    validateSaveSection,
    validateSubmitForm,
};