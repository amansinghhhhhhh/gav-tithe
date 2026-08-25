const Assessment = require("../models/Assessment");

const CORRECT_KEYS = ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D", "D"];

const calculateScore = (answers) => {
    let score = 0;
    for (const ans of answers) {
        const correct = CORRECT_KEYS[ans.questionIndex];
        if (ans.selectedOptions.includes(correct)) score++;
    }
    return score;
};

// ── Get my assessment progress ────────────────────────────────────────────────
const getMyAssessment = async (req, res) => {
    try {
        let assessment = await Assessment.findOne({ userId: req.user.id });
        if (!assessment) {
            assessment = await Assessment.create({ userId: req.user.id });
        }
        res.json({
            success: true,
            assessment: {
                currentStep: assessment.currentStep,
                answers: assessment.answers,
                completed: assessment.completed,
                completedAt: assessment.completedAt,
                totalAttempts: assessment.totalAttempts,
                score: assessment.score,
            },
        });
    } catch (err) {
        console.error("Get assessment error:", err.message);
        res.status(500).json({ message: "Fetch failed" });
    }
};

// ── Save answer for a step ───────────────────────────────────────────────────
const saveAnswer = async (req, res) => {
    try {
        const { step, selectedOptions } = req.body;

        if (!step || step < 1 || step > 15) {
            return res.status(400).json({ success: false, message: "Invalid step" });
        }

        if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
            return res.status(400).json({ success: false, message: "Select at least one option" });
        }

        let assessment = await Assessment.findOne({ userId: req.user.id });
        if (!assessment) {
            assessment = await Assessment.create({ userId: req.user.id });
        }

        if (assessment.completed) {
            return res.status(400).json({ success: false, message: "Assessment already completed. Please retake." });
        }

        const questionIndex = step - 1;

        // Remove existing answer for this question
        assessment.answers = assessment.answers.filter((a) => a.questionIndex !== questionIndex);

        // Add new answer
        assessment.answers.push({
            questionIndex,
            selectedOptions,
            answeredAt: Date.now(),
        });

        // Update currentStep to next unanswered step
        const answeredSteps = assessment.answers.map((a) => a.questionIndex + 1);
        let nextStep = 1;
        for (let i = 1; i <= 15; i++) {
            if (!answeredSteps.includes(i)) {
                nextStep = i;
                break;
            }
        }
        // If all 15 answered, keep at 15
        if (answeredSteps.length >= 15) nextStep = 15;

        assessment.currentStep = nextStep;
        assessment.updatedAt = Date.now();
        await assessment.save();

        res.json({
            success: true,
            message: "Answer saved",
            currentStep: assessment.currentStep,
            answeredCount: assessment.answers.length,
        });
    } catch (err) {
        console.error("Save answer error:", err.message);
        res.status(500).json({ message: "Save failed" });
    }
};

// ── Complete assessment ──────────────────────────────────────────────────────
const completeAssessment = async (req, res) => {
    try {
        let assessment = await Assessment.findOne({ userId: req.user.id });
        if (!assessment) {
            return res.status(400).json({ success: false, message: "No assessment found" });
        }

        if (assessment.answers.length < 15) {
            return res.status(400).json({
                success: false,
                message: `Please answer all 15 questions. ${15 - assessment.answers.length} remaining.`,
            });
        }

        assessment.completed = true;
        assessment.completedAt = Date.now();
        assessment.totalAttempts += 1;
        assessment.score = calculateScore(assessment.answers);
        assessment.updatedAt = Date.now();
        await assessment.save();

        res.json({
            success: true,
            message: "Assessment completed!",
            completedAt: assessment.completedAt,
            score: assessment.score,
        });
    } catch (err) {
        console.error("Complete assessment error:", err.message);
        res.status(500).json({ message: "Completion failed" });
    }
};

// ── Retake assessment ────────────────────────────────────────────────────────
const retakeAssessment = async (req, res) => {
    try {
        let assessment = await Assessment.findOne({ userId: req.user.id });
        if (!assessment) {
            assessment = await Assessment.create({ userId: req.user.id });
        }

        assessment.currentStep = 1;
        assessment.answers = [];
        assessment.completed = false;
        assessment.completedAt = null;
        assessment.score = 0;
        assessment.updatedAt = Date.now();
        await assessment.save();

        res.json({
            success: true,
            message: "Assessment reset. You can retake it.",
        });
    } catch (err) {
        console.error("Retake assessment error:", err.message);
        res.status(500).json({ message: "Retake failed" });
    }
};

module.exports = { getMyAssessment, saveAnswer, completeAssessment, retakeAssessment };
