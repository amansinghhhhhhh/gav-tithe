const mongoose = require("mongoose");

const SevaFirstApplicationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        uniqueId: { type: String, required: true, unique: true },

        applicant: {
            name: { type: String, required: true, trim: true },
            mobile: { type: String, required: true, trim: true },
            email: { type: String, required: true, trim: true, lowercase: true },
            location: { type: String, required: true, trim: true },
            aadhaar: { type: String, required: true, trim: true },
            pan: { type: String, default: "", trim: true },
        },

        teamMembers: [
            {
                name: { type: String, default: "" },
                role: { type: String, default: "" },
                contact: { type: String, default: "" },
            },
        ],

        idea: {
            category: { type: String, required: true },
            problem: { type: String, required: true },
            solution: { type: String, required: true },
        },

        budget: {
            cost: { type: Number, required: true, min: 1000 },
            timelineMonths: { type: Number, required: true, min: 1, max: 60 },
            implementationPlan: { type: String, required: true },
            videoLink: { type: String, default: "" },
        },

        files: {
            ppt: { type: mongoose.Schema.Types.ObjectId, default: null },
            idProof: { type: mongoose.Schema.Types.ObjectId, default: null },
            prototype: { type: mongoose.Schema.Types.ObjectId, default: null },
            research: { type: mongoose.Schema.Types.ObjectId, default: null },
        },

        status: {
            type: String,
            enum: ["submitted", "under_review", "approved", "rejected"],
            default: "submitted",
        },
        adminRemark: { type: String, default: "" },
    },
    { timestamps: true }
);

SevaFirstApplicationSchema.index({ status: 1, createdAt: -1 });
SevaFirstApplicationSchema.index({ "applicant.mobile": 1 });

module.exports = mongoose.model("SevaFirstApplication", SevaFirstApplicationSchema);
