# Evaluation rubric — how VoteWise AI maps it

Concise pointers for reviewers and automated scans.

| Axis | Evidence in repo |
|------|-------------------|
| **Code quality / readability** | Structured `frontend/src/` (pages, components, hooks, services) and `backend/src/` (routes → controllers → services → validators). TypeScript strict, Zod at API boundaries. |
| **Safety** | `helmet`, `express-rate-limit`, bcrypt passwords, JWT `requireRole`, **`express.json({ limit: '1mb' })`** with **explicit 413** on oversize bodies (`middleware/error.ts`), CORS allow-list, secrets only via env (`.env.example`). |
| **Resource efficiency** | Translation batched (`CHUNK` in controller); JSON body caps; guarded Gemini fallbacks (`geminiService.ts`); SPA code-split friendly Vite setup. |
| **Testing / maintainability** | `backend/tests/*.test.ts` — health, validators, API contract, security headers, payload limit; `frontend/tests/*.test.tsx` — components + a11y. Run `npm test` in each package. |
| **Accessibility** | `AccessibilityPanel`, `Navbar` landmark + labelled controls, progressive enhancement patterns; frontend tests exercise roles/names where practical. |
| **Google services** | Backend **`/api/translate`** (Translation API key server-side); **`/api/chat`** Gemini with decision-engine fallback; frontend `services/translate.ts`, `gemini.ts`, maps/calendar stubs with env examples. |
