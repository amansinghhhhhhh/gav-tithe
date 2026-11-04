const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
    {
        questionId: { type: Number, required: true },
        selectedOptions: [{ type: String }],
        text: { type: String, default: "" },
        answeredAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const RespondentSchema = new mongoose.Schema(
    {
        whatsapp: { type: String, default: "" },
        village: { type: String, default: "" },
        taluka: { type: String, default: "" },
        district: { type: String, default: "" },
        age18: { type: Boolean, default: false },
        consent: { type: Boolean, default: false },
        savedAt: { type: Date, default: null },
    },
    { _id: false }
);

const ProfileFlagsSchema = new mongoose.Schema(
    {
        barrier: { key: String, label: String },
        helpWanted: [{ key: String, label: String }],
        familyOutreach: { type: Boolean, default: false },
        storyConsent: { type: String, default: null },
        mentorStoryCandidate: { type: Boolean, default: false },
        sector: { key: String, label: String },
        learningMode: { key: String, label: String },
        opportunity: { type: String, default: "" },
        obstacle: { type: String, default: "" },
    },
    { _id: false }
);

const ProfileSchema = new mongoose.Schema(
    {
        stage: { type: String, default: null },
        style: { type: String, default: null },
        track: { type: Number, default: null },
        trackName: { type: String, default: null },
        answeredSet: { type: Number, default: null },
        flags: { type: ProfileFlagsSchema, default: () => ({}) },
    },
    { _id: false }
);

const AssessmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    version: { type: Number, default: 2 },
    setId: { type: Number, enum: [1, 2, 3, 4], default: null },
    respondent: { type: RespondentSchema, default: () => ({}) },
    answers: [AnswerSchema],
    currentStep: { type: Number, default: 1, min: 1 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    totalAttempts: { type: Number, default: 0 },
    profile: { type: ProfileSchema, default: () => ({}) },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Assessment", AssessmentSchema);
