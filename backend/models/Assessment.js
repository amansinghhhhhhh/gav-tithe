const mongoose = require("mongoose");

const AssessmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    currentStep: { type: Number, default: 1, min: 1, max: 15 },
    answers: [
        {
            questionIndex: { type: Number, required: true },
            selectedOptions: [{ type: String }],
            answeredAt: { type: Date, default: Date.now },
        },
    ],
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    totalAttempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Assessment", AssessmentSchema);
