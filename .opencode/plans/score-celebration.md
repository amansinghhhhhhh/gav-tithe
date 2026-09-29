# Plan: Assessment score celebration — confetti + count-up

**Approved by user** (choices: canvas-confetti lib, sirf turant complete par trigger, count-up haan).
Status: READY TO EXECUTE (awaiting plan-mode exit).

## Changes

### 1. Dependency
`npm i canvas-confetti` in `frontend-user` (~6KB, direct import — immediate fire).

### 2. `frontend-user/src/components/assessment/MyAssessment.jsx`
- New state: `const [justCompleted, setJustCompleted] = useState(false);`
- `handleNext` complete-success branch → `setJustCompleted(true)` (alongside existing completed/score updates)
- `loadAssessment` → when assessment completed on load (refresh/revisit) → `setJustCompleted(false)`
- `handleRetake` → `setJustCompleted(false)`
- Render: `<AssessmentComplete ... celebrate={justCompleted} />`

### 3. `frontend-user/src/components/assessment/AssessmentComplete.jsx`
- New prop `celebrate`
- **Confetti useEffect** (runs only if `celebrate`):
  - import confetti from "canvas-confetti"
  - 3 staggered bursts at t=0/500/1000ms: `{ particleCount: 90, angle: 90, spread: 80, startVelocity: 50, gravity: 1, ticks: 300, origin: { x: 0.2|0.5|0.8, y: -0.04 }, colors: ["#F97316","#142952","#1A7A3C","#560A0A","#fbbf24","#fff"], shapes: ["square","circle"], zIndex: 10001 }`
  - cleanup: clear timeouts + `confetti.reset()`
- **Count-up**: `displayScore` state — celebrate par `0→score` (120ms/step, score 0 → direct 0, interval cleanup); warna seedha `score`
- Score box renders `{displayScore} / 15`

## Not changed
Backend, translations.js, refresh behavior (refresh par sirf score, bina confetti — user choice).

## Verify
`npx vite build` in `frontend-user` (EXIT=0). Deploy: Vercel.
