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
            aadhaar: mongoose.Schema.Types.ObjectId,
            pan: mongoose.Schema.Types.ObjectId,
            udyam: mongoose.Schema.Types.ObjectId,
            passport: mongoose.Schema.Types.ObjectId,
        },
    },

    status: { type: String, enum: ["draft", "submitted", "approved", "rejected"], default: "draft" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FormData", FormDataSchema);