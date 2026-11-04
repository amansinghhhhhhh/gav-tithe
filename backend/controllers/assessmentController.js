const crypto = require("crypto");
const Assessment = require("../models/Assessment");
const {
    SET_IDS,
    STAGE_BY_KEY,
    TRACK_BY_STAGE,
    getSet,
    getQuestion,
    getQuestionCount,
    getPublicQuestions,
    getOption,
    getScoringTags,
} = require("../constants/assessmentSets");

const STYLE_BY_TAG = { L: "learner", P: "planner", N: "networker", E: "experimenter" };
const MAX_TEXT = 300;

const freshProfile = () => ({
    stage: null,
    style: null,
    track: null,
    trackName: null,
    answeredSet: null,
    flags: {},
});

const randomSetId = () => SET_IDS[crypto.randomInt(0, SET_IDS.length)];

const normalizeWhatsapp = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
    return digits;
};

const isRespondentReady = (assessment) => {
    const r = assessment.respondent || {};
    return !!(
        r.savedAt &&
        r.whatsapp &&
        r.village &&
        r.taluka &&
        r.district &&
        r.age18 === true &&
        r.consent === true
    );
};

const resetLegacy = (assessment) => {
    assessment.version = 2;
    assessment.setId = randomSetId();
    assessment.respondent = {};
    assessment.answers = [];
    assessment.currentStep = 1;
    assessment.completed = false;
    assessment.completedAt = null;
    assessment.totalAttempts = 0;
    assessment.profile = freshProfile();
};

const ensureAssessment = async (userId) => {
    let assessment = await Assessment.findOne({ userId });
    if (!assessment) {
        assessment = await Assessment.create({ userId, setId: randomSetId() });
        return assessment;
    }
    if (!assessment.version || assessment.version < 2 || !assessment.setId) {
        resetLegacy(assessment);
        await assessment.save();
    }
    return assessment;
};

const publicAssessment = (assessment) => {
    const r = assessment.respondent || {};
    return {
        setId: assessment.setId,
        totalQuestions: getQuestionCount(assessment.setId),
        currentStep: assessment.currentStep,
        answers: (assessment.answers || []).map((a) => ({
            questionId: a.questionId,
            selectedOptions: a.selectedOptions || [],
            text: a.text || "",
            answeredAt: a.answeredAt,
        })),
        respondent: {
            whatsapp: r.whatsapp || "",
            village: r.village || "",
            taluka: r.taluka || "",
            district: r.district || "",
            age18: !!r.age18,
            consent: !!r.consent,
            savedAt: r.savedAt || null,
        },
        completed: assessment.completed,
        completedAt: assessment.completedAt,
        totalAttempts: assessment.totalAttempts,
        profile: assessment.profile || freshProfile(),
        questions: getPublicQuestions(assessment.setId),
    };
};

const hasAnswer = (question, answer) => {
    if (!answer) return false;
    if (question.type === "text") return !!String(answer.text || "").trim();
    return Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0;
};

const computeNextStep = (set, answers) => {
    const answered = new Set(answers.map((a) => a.questionId));
    for (let i = 0; i < set.length; i++) {
        if (!answered.has(set[i].id)) return i + 1;
    }
    return set.length;
};

const computeProfile = (setId, answerMap) => {
    const flags = {};

    const stageAnswer = answerMap.get(6);
    const stage = stageAnswer ? STAGE_BY_KEY[stageAnswer.selectedOptions[0]] || null : null;

    const tags = getScoringTags(setId);
    const counts = { L: 0, P: 0, N: 0, E: 0 };
    for (const [qid, byKey] of Object.entries(tags)) {
        const answer = answerMap.get(Number(qid));
        if (!answer) continue;
        for (const key of answer.selectedOptions) {
            const tag = byKey[key];
            if (tag && counts[tag] !== undefined) counts[tag] += 1;
        }
    }
    const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const style =
        ranked[0][1] >= 3 && ranked[0][1] > ranked[1][1]
            ? STYLE_BY_TAG[ranked[0][0]]
            : "balanced";

    const trackInfo = stage ? TRACK_BY_STAGE[stage] : { track: null, trackName: null };

    const barrierAnswer = answerMap.get(52);
    if (barrierAnswer) {
        const opt = getOption(setId, 52, barrierAnswer.selectedOptions[0]);
        if (opt) flags.barrier = { key: opt.key, label: opt.en };
    }

    const helpAnswer = answerMap.get(56);
    if (helpAnswer) {
        flags.helpWanted = helpAnswer.selectedOptions
            .map((key) => {
                const opt = getOption(setId, 56, key);
                return opt ? { key: opt.key, label: opt.en } : null;
            })
            .filter(Boolean);
    }

    flags.familyOutreach = !!(
        answerMap.get(53) && answerMap.get(53).selectedOptions[0] === "C"
    );

    const storyAnswer = answerMap.get(58);
    if (storyAnswer) {
        const key = storyAnswer.selectedOptions[0];
        flags.storyConsent = key === "A" ? "yes" : key === "B" ? "later" : "no";
    }

    const sectorAnswer = answerMap.get(8);
    if (sectorAnswer) {
        const opt = getOption(setId, 8, sectorAnswer.selectedOptions[0]);
        if (opt) flags.sector = { key: opt.key, label: opt.en };
    }

    const learningAnswer = answerMap.get(57);
    if (learningAnswer) {
        const opt = getOption(setId, 57, learningAnswer.selectedOptions[0]);
        if (opt) flags.learningMode = { key: opt.key, label: opt.en };
    }

    const opportunityAnswer = answerMap.get(59);
    if (opportunityAnswer && opportunityAnswer.text) flags.opportunity = opportunityAnswer.text;

    const obstacleAnswer = answerMap.get(60);
    if (obstacleAnswer && obstacleAnswer.text) flags.obstacle = obstacleAnswer.text;

    flags.mentorStoryCandidate = !!(trackInfo.track >= 3 && flags.storyConsent === "yes");

    return {
        stage,
        style,
        track: trackInfo.track,
        trackName: trackInfo.trackName,
        answeredSet: setId,
        flags,
    };
};

// ── Get my assessment (also assigns the random set once) ─────────────────────
const getMyAssessment = async (req, res) => {
    try {
        const assessment = await ensureAssessment(req.user.id);
        res.json({ success: true, assessment: publicAssessment(assessment) });
    } catch (err) {
        console.error("Get assessment error:", err.message);
        res.status(500).json({ success: false, message: "Fetch failed" });
    }
};

// ── Save respondent details + consent ────────────────────────────────────────
const saveRespondent = async (req, res) => {
    try {
        const assessment = await ensureAssessment(req.user.id);
        if (assessment.completed) {
            return res.status(400).json({ success: false, code: "completed", message: "Assessment already completed" });
        }

        const whatsapp = normalizeWhatsapp(req.body.whatsapp);
        const village = String(req.body.village || "").trim();
        const taluka = String(req.body.taluka || "").trim();
        const district = String(req.body.district || "").trim();
        const age18 = req.body.age18 === true;
        const consent = req.body.consent === true;

        if (!/^[6-9]\d{9}$/.test(whatsapp)) {
            return res.status(400).json({ success: false, code: "whatsapp_invalid", message: "Enter a valid 10-digit WhatsApp number" });
        }
        if (!village || village.length > 80) {
            return res.status(400).json({ success: false, code: "village_invalid", message: "Village is required" });
        }
        if (!taluka || taluka.length > 80) {
            return res.status(400).json({ success: false, code: "taluka_invalid", message: "Taluka is required" });
        }
        if (!district || district.length > 80) {
            return res.status(400).json({ success: false, code: "district_invalid", message: "District is required" });
        }
        if (!age18) {
            return res.status(400).json({ success: false, code: "age_required", message: "18+ confirmation is required" });
        }
        if (!consent) {
            return res.status(400).json({ success: false, code: "consent_required", message: "Consent is required" });
        }

        assessment.respondent = {
            whatsapp,
            village,
            taluka,
            district,
            age18,
            consent,
            savedAt: new Date(),
        };
        assessment.updatedAt = Date.now();
        await assessment.save();

        res.json({ success: true, respondent: publicAssessment(assessment).respondent });
    } catch (err) {
        console.error("Save respondent error:", err.message);
        res.status(500).json({ success: false, message: "Save failed" });
    }
};

// ── Save answer for one question ─────────────────────────────────────────────
const saveAnswer = async (req, res) => {
    try {
        const assessment = await ensureAssessment(req.user.id);
        if (assessment.completed) {
            return res.status(400).json({ success: false, code: "completed", message: "Assessment already completed. Please retake." });
        }
        if (!isRespondentReady(assessment)) {
            return res.status(400).json({ success: false, code: "respondent_required", message: "Please complete your details first" });
        }

        const questionId = Number(req.body.questionId);
        const question = getQuestion(assessment.setId, questionId);
        if (!question) {
            return res.status(400).json({ success: false, code: "invalid_question", message: "Invalid question" });
        }

        const set = getSet(assessment.setId);
        let selectedOptions = [];
        let text = "";

        if (question.type === "text") {
            text = String(req.body.text || "").trim();
            const limit = question.maxLength || MAX_TEXT;
            if (text.length > limit) {
                return res.status(400).json({ success: false, code: "text_too_long", message: `Answer must be ${limit} characters or less` });
            }
            if (question.required !== false && !text) {
                return res.status(400).json({ success: false, code: "answer_required", message: "This answer is required" });
            }
        } else {
            if (!Array.isArray(req.body.selectedOptions)) {
                return res.status(400).json({ success: false, code: "answer_required", message: "Select at least one option" });
            }
            selectedOptions = [...new Set(req.body.selectedOptions.map(String))];
            if (selectedOptions.length === 0) {
                if (question.type === "multi") {
                    assessment.answers = assessment.answers.filter((a) => a.questionId !== questionId);
                    assessment.currentStep = computeNextStep(set, assessment.answers);
                    assessment.updatedAt = Date.now();
                    await assessment.save();
                    return res.json({
                        success: true,
                        currentStep: assessment.currentStep,
                        answeredCount: assessment.answers.length,
                        totalQuestions: set.length,
                    });
                }
                return res.status(400).json({ success: false, code: "answer_required", message: "Select at least one option" });
            }
            const validKeys = question.options.map((o) => o.key);
            if (selectedOptions.some((key) => !validKeys.includes(key))) {
                return res.status(400).json({ success: false, code: "invalid_option", message: "Invalid option selected" });
            }
            if (question.type === "single" && selectedOptions.length !== 1) {
                return res.status(400).json({ success: false, code: "single_required", message: "Select exactly one option" });
            }
            if (question.type === "multi" && question.maxSelect && selectedOptions.length > question.maxSelect) {
                return res.status(400).json({ success: false, code: "too_many", message: `Select up to ${question.maxSelect} options` });
            }
        }

        assessment.answers = assessment.answers.filter((a) => a.questionId !== questionId);

        // Optional empty answer: just clear it.
        if (question.type === "text" && question.required === false && !text) {
            assessment.currentStep = computeNextStep(set, assessment.answers);
            assessment.updatedAt = Date.now();
            await assessment.save();
            return res.json({
                success: true,
                currentStep: assessment.currentStep,
                answeredCount: assessment.answers.length,
                totalQuestions: set.length,
            });
        }

        assessment.answers.push({ questionId, selectedOptions, text, answeredAt: new Date() });
        assessment.currentStep = computeNextStep(set, assessment.answers);
        assessment.updatedAt = Date.now();
        await assessment.save();

        res.json({
            success: true,
            currentStep: assessment.currentStep,
            answeredCount: assessment.answers.length,
            totalQuestions: set.length,
        });
    } catch (err) {
        console.error("Save answer error:", err.message);
        res.status(500).json({ success: false, message: "Save failed" });
    }
};

// ── Complete assessment + compute profile ────────────────────────────────────
const completeAssessment = async (req, res) => {
    try {
        const assessment = await ensureAssessment(req.user.id);
        if (assessment.completed) {
            return res.status(400).json({ success: false, code: "completed", message: "Assessment already completed" });
        }
        if (!isRespondentReady(assessment)) {
            return res.status(400).json({ success: false, code: "respondent_required", message: "Please complete your details first" });
        }

        const set = getSet(assessment.setId);
        const answerMap = new Map(assessment.answers.map((a) => [a.questionId, a]));
        const missing = set.filter((q) => q.required !== false && !hasAnswer(q, answerMap.get(q.id)));
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                code: "incomplete",
                missing: missing.length,
                message: `Please answer all required questions. ${missing.length} remaining.`,
            });
        }

        const profile = computeProfile(assessment.setId, answerMap);
        assessment.profile = profile;
        assessment.completed = true;
        assessment.completedAt = new Date();
        assessment.totalAttempts += 1;
        assessment.currentStep = set.length;
        assessment.updatedAt = Date.now();
        await assessment.save();

        res.json({
            success: true,
            message: "Assessment completed!",
            completedAt: assessment.completedAt,
            totalAttempts: assessment.totalAttempts,
            profile,
        });
    } catch (err) {
        console.error("Complete assessment error:", err.message);
        res.status(500).json({ success: false, message: "Completion failed" });
    }
};

// ── Retake (same set, same respondent) ───────────────────────────────────────
const retakeAssessment = async (req, res) => {
    try {
        const assessment = await ensureAssessment(req.user.id);
        assessment.currentStep = 1;
        assessment.answers = [];
        assessment.completed = false;
        assessment.completedAt = null;
        assessment.profile = freshProfile();
        assessment.updatedAt = Date.now();
        await assessment.save();

        res.json({ success: true, message: "Assessment reset. You can retake it.", setId: assessment.setId });
    } catch (err) {
        console.error("Retake assessment error:", err.message);
        res.status(500).json({ success: false, message: "Retake failed" });
    }
};

module.exports = { getMyAssessment, saveRespondent, saveAnswer, completeAssessment, retakeAssessment };
