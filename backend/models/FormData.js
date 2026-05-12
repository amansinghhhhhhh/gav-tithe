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
        address: String,
        otpVerified: Boolean,
    },

    section2: {
        businessName: String,
        businessType: String,
        sector: String,
        businessStatus: String,
        employment: String,
        investment: String,
    },

    section3: {
        hadLoan: String,
        loanType: String,
        repaymentStatus: String,
        cibilScore: String,
        pastDifficulty: String,
    },

    section4: {
        aadhaar: String,
        pan: String,
        bankName: String,
        accountNo: String,
        docs: {
            aadhaar: { type: mongoose.Schema.Types.Mixed, default: null },
            pan: { type: mongoose.Schema.Types.Mixed, default: null },
            udyam: { type: mongoose.Schema.Types.Mixed, default: null },
            passport: { type: mongoose.Schema.Types.Mixed, default: null },
        },
    },

    status: {
        type: String,
        enum: ["draft", "submitted", "under_review", "approved", "rejected"], // ← under_review add kiya
        default: "draft",
    },
    adminRemark: { type: String, default: "" }, // ← naya field
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FormData", FormDataSchema);