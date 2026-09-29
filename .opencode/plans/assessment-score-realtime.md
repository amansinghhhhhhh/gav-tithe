# Plan: Assessment score — real-time update (1-line fix)

**Approved by user.** Status: READY TO EXECUTE (awaiting plan-mode exit).

## Root cause
`frontend-user/src/components/assessment/MyAssessment.jsx` — `handleNext` complete branch (~line 89-92):
```js
const res = await completeAssessment();
if (res.success) {
  setCurrentStep(16);
  setAssessment((prev) => ({ ...prev, completed: true }));  // score missing!
}
```
Backend `completeAssessment` already returns `score` (backend/controllers/assessmentController.js:127) but frontend ignores it → `assessment.score` stays at mount-time value (0 = DB default) → `AssessmentComplete` shows 0/15 until refresh reloads fresh score.

## Fix — single line
`MyAssessment.jsx:92` →
```js
setAssessment((prev) => ({ ...prev, completed: true, score: res.score }));
```

Covers retake→recomplete too (every completion gets fresh `res.score`).

## Not changed
- Backend (score already in response) — no Railway deploy
- `App.jsx` `assessmentScore` state is write-only/dead — leave as-is
- `AssessmentComplete.jsx` — receives prop correctly

## Verify
`npx vite build` in `frontend-user` (EXIT=0).
