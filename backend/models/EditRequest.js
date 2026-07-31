const mongoose = require("mongoose");

const EditRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "resolved"],
        default: "pending",
    },
    remark: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EditRequest", EditRequestSchema);
