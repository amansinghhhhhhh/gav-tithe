# Plan: Assessment — single-select (ek hi answer per question)

**Approved by user** (question answer: "Single-select banao"). Status: READY TO EXECUTE (awaiting plan-mode exit).

## Scope — sirf frontend (backend unchanged)

### 1. `frontend-user/src/components/assessment/QuestionStep.jsx`
- `handleToggle` → single-select radio semantics:
  ```js
  const handleToggle = (key) => {
    if (disabled) return;
    if (selectedOptions[0] === key) return; // already selected — no-op
    onSelect([key]); // naya click purane ko replace kare
  };
  ```
- Naya prop `disabled` (saving ke time options clickable nahi — race guard)
- Hint text (lines 83-85):
  - mr: `"सर्वात योग्य उत्तर निवडा:"`
  - en: `"Select the best answer:"`
- Visual: square checkbox → **round radio** (borderRadius "50%" outer + inner dot on select; selected fill navy waisa hi)

### 2. `frontend-user/src/components/assessment/MyAssessment.jsx`
- Intro instruction line (lines 271-273):
  - mr: `"प्रत्येक प्रश्नासाठी फक्त एक सर्वात योग्य उत्तर निवडा"`
  - en: `"Select only one best answer per question"`
- `<QuestionStep ... disabled={saving} />` pass karo

### 3. Backend — NO change
- `selectedOptions: [String]` array me ek element jaayega — model/controller dono chalte rahenge
- Scoring `includes("D")` single-select ke liye equality jaisa hi hai — theek
- Purane multi-answers DB me jaise hain waise rehne dete hain (retake pe waise bhi clear hote hain)
- **Railway deploy ki zaroorat nahi**

### 4. Verify
- `npx vite build` in `frontend-user` (EXIT=0)

## Not changed
translations.js (ye strings inline lang==="mr" wale hain), scoring keys, routes, admin.
