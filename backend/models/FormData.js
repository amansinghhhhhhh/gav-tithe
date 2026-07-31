const mongoose = require("mongoose");

const FormDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    section1: {
        fullName: String,
        dob: String,
        gender: String,
        mobile: String,
        email: String,
        education: String,
        // ✅ address string → object
        address: {
            dist: { type: String, default: "" },
            taluka: { type: String, default: "" },
            village: { type: String, default: "" },
            pincode: { type: String, default: "" },
        },
        otpVerified: Boolean,
    },

    section2: {
        businessName: String,
        businessType: String,
        sector: String,
        sectorOther: String,
        businessStatus: String,
        employment: String,
        investment: String,
    },

    section3: {
        hadLoan: String,
        loanType: String,
        loanTypeOther: String,
        repaymentStatus: String,
        cibilScore: String,
        pastDifficulty: String,
    },

    section4: {
        aadhaar: String,
        pan: String,
        udyam: String,
        bankName: String,
        accountNo: String,
        docs: {
            aadhaarFront: { type: mongoose.Schema.Types.Mixed, default: null },
            aadhaarBack: { type: mongoose.Schema.Types.Mixed, default: null },
            pan: { type: mongoose.Schema.Types.Mixed, default: null },
            udyam: { type: mongoose.Schema.Types.Mixed, default: null },
            passport: { type: mongoose.Schema.Types.Mixed, default: null },
        },
        // ✅ OCR se document se extract kiya number (client se bypass nahi ho sakta — submit pe client value ignore hoti hai)
        ocr: {
            aadhaarFront: { type: String, default: null },
            pan: { type: String, default: null },
            udyam: { type: String, default: null },
        },
    },

    status: {
        type: String,
        enum: ["draft", "submitted", "under_review", "approved", "rejected"],
        default: "draft",
    },
    editAllowed: { type: Boolean, default: false },
    adminRemark: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // ✅ Latest submit date — har submit/resubmit pe update (draft save pe nahi)
    submittedAt: { type: Date, default: null },
});

module.exports = mongoose.model("FormData", FormDataSchema);