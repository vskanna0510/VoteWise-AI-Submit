# 🗳️ VoteWise AI — Interactive Election Process Assistant

> **A neutral, accessible, AI-powered learning companion that explains the election process to every kind of citizen — without ever recommending a candidate, party, or vote.**

[![Built with TypeScript](https://img.shields.io/badge/Built%20With-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Node 20](https://img.shields.io/badge/Node-20-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-purple)](#license)

---

## 1. Overview

**VoteWise AI** is a production-quality full-stack web application that helps citizens understand the **election process, timelines, and steps** through an interactive, gamified, AI-assisted experience.

The platform is **strictly politically neutral** — it never recommends candidates, parties, or voting choices. It only educates, guides, and empowers.

It is designed to be a **hackathon-grade reference implementation** demonstrating:

- A **smart, role-aware AI assistant** powered by a custom Decision Engine
- Deep integration with **Google services** (Firebase Auth, Gemini, Translate, Maps, Calendar, Analytics)
- A **premium dark-navy + purple glassmorphism UI** built with React + Tailwind + Framer Motion
- A **secure, validated, rate-limited Express + MongoDB** backend
- **First-class accessibility** (ARIA, dyslexia mode, high-contrast, font scaling, voice input placeholder)

---

## 2. Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🤖 **AI Election Assistant** | Context-aware chatbot adapts to first-time voters, students, officers, candidates, admins. Refuses unsafe queries. |
| 2 | 📅 **Interactive Timeline** | 8-step election lifecycle — animated, scroll-synced, accessible. |
| 3 | 🎮 **Election Simulator** | Walkthrough each phase as if you were participating. |
| 4 | ✅ **Voter Checklist** | Personal task list with progress %, Google Calendar reminders. |
| 5 | 🧠 **Quiz + Certificate** | MCQ test → score → downloadable certificate stored on Firebase. |
| 6 | 💡 **Myth vs Fact** | 8+ flip cards busting common election misconceptions. |
| 7 | 🛠️ **Admin Dashboard** | Manage FAQs, timeline steps, view analytics. |
| 8 | ♿ **Accessibility Panel** | Font size, high-contrast, dyslexia mode, voice input, language. |
| 9 | 📊 **Evaluation Matrix** | Visual scorecard for code quality, security, UX, etc. |

---

## 3. Tech Stack

### Frontend
- **React 18 + TypeScript + Vite**
- **Tailwind CSS** + custom design tokens
- **Framer Motion** for fluid animation
- **React Router 6** for routing
- **Lucide Icons** for crisp SVG icons
- **Axios** for API calls

### Backend
- **Node.js 20 + Express 4 + TypeScript**
- **MongoDB + Mongoose** (with indexing)
- **JWT** authentication + **bcrypt** password hashing
- **Zod** validation
- **Helmet** security headers
- **express-rate-limit** for abuse protection
- **Morgan** logging

### AI Layer
- **Decision Engine** (intent classification + role-based routing)
- **Gemini API service** (placeholder, RAG-ready)
- **Neutrality Guardrails** (refusal patterns)

### Google Services (placeholder + UI integration)
- Firebase Authentication (Google login)
- Google Gemini API (AI assistant)
- Google Translate API (multi-language)
- Google Maps API (polling booth UI)
- Google Calendar API (reminders)
- Firebase Storage (certificate hosting)
- Google Analytics (page tracking)
- Google Cloud Run (deployment notes)

---

## 4. Project Structure

```
votewise-ai/
├── README.md
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── src/
│   │   ├── server.ts
│   │   ├── config/         # env, db, constants
│   │   ├── controllers/    # auth, faq, timeline, quiz, chat
│   │   ├── middleware/     # auth, error, rateLimit, validate
│   │   ├── models/         # User, FAQ, TimelineStep, QuizQuestion, ChatLog
│   │   ├── routes/         # /auth /faqs /timeline /quiz /chat
│   │   ├── services/       # geminiService, decisionEngine, neutralityGuard
│   │   ├── validators/     # Zod schemas
│   │   └── utils/          # logger, jwt, seed
│   └── tests/
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    ├── index.html
    ├── .env.example
    ├── public/
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── components/     # Navbar, Chatbot, AccessibilityPanel, Cards…
        ├── pages/          # 10 pages
        ├── layouts/        # MainLayout, DashboardLayout
        ├── hooks/          # useUserContext, useAccessibility, useApi
        ├── services/       # api, gemini, firebase, translate, maps, calendar
        ├── utils/          # cn, formatters, decisionEngineClient
        ├── data/           # timeline, quiz, myths, faqs (seed)
        └── assets/
```

---

## 5. Setup Instructions

### Prerequisites
- **Node.js ≥ 20**
- **MongoDB** running locally on `mongodb://localhost:27017` (or any MongoDB Atlas URI)
- **npm** ≥ 10

### Clone & Install

```bash
# Backend
cd votewise-ai/backend
cp .env.example .env
npm install
npm run seed        # populates DB with timeline, FAQs, quiz, default admin
npm run dev         # starts http://localhost:5000

# Frontend (new terminal)
cd votewise-ai/frontend
cp .env.example .env
npm install
npm run dev         # starts http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### Default Admin Login
| Email | Password | Role |
|-------|----------|------|
| `admin@votewise.ai` | `Admin@123` | admin |

A demo voter account is also seeded:

| Email | Password | Role |
|-------|----------|------|
| `voter@votewise.ai` | `Voter@123` | first_time_voter |

---

## 6. Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         VoteWise AI                                │
│                                                                    │
│   ┌──────────────────┐        ┌────────────────────────────────┐  │
│   │  React Frontend  │  HTTPS │       Express Backend          │  │
│   │  (Vite + TS)     │ <────> │  Auth · FAQ · Timeline · Quiz  │  │
│   │                  │  JWT   │  Chat · Admin · Health         │  │
│   └────────┬─────────┘        └────────┬───────────────────────┘  │
│            │                            │                          │
│            │ Firebase Auth              │ Mongoose                 │
│            │ Translate · Maps           │                          │
│            │ Calendar · Analytics       ▼                          │
│            │                    ┌───────────────┐                  │
│            │                    │   MongoDB     │                  │
│            │                    └───────────────┘                  │
│            │                            │                          │
│            ▼                            ▼                          │
│   ┌──────────────────┐         ┌──────────────────────┐           │
│   │  Decision Engine │ ──────> │  Gemini API (mock)   │           │
│   │  + Neutrality    │         │  RAG-ready           │           │
│   │  Guardrails      │         └──────────────────────┘           │
│   └──────────────────┘                                             │
└────────────────────────────────────────────────────────────────────┘
```

---

## 7. API List

| Method | Endpoint                | Auth        | Description                                |
|--------|-------------------------|-------------|--------------------------------------------|
| GET    | `/api/health`           | public      | Health check                               |
| POST   | `/api/auth/register`    | public      | Register a new user                        |
| POST   | `/api/auth/login`       | public      | Login → returns JWT                        |
| GET    | `/api/auth/me`          | user        | Get current user                           |
| GET    | `/api/faqs`             | public      | List FAQs                                  |
| POST   | `/api/faqs`             | admin       | Create FAQ                                 |
| PUT    | `/api/faqs/:id`         | admin       | Update FAQ                                 |
| DELETE | `/api/faqs/:id`         | admin       | Delete FAQ                                 |
| GET    | `/api/timeline`         | public      | List timeline steps                        |
| POST   | `/api/timeline`         | admin       | Create timeline step                       |
| PUT    | `/api/timeline/:id`     | admin       | Update timeline step                       |
| GET    | `/api/quiz`             | public      | Get quiz questions                         |
| POST   | `/api/quiz/submit`      | user        | Submit quiz, get score & cert id           |
| POST   | `/api/chat`             | public      | Talk to AI assistant (decision-engine)     |
| GET    | `/api/admin/analytics`  | admin       | Aggregated analytics                       |

---

## 8. Google Services

Each service has:

- A **service file** (`frontend/src/services/*.ts`)
- **UI integration** in pages/components
- **Env config** in `frontend/.env.example`

| Service        | File                                  | Purpose                  |
|----------------|---------------------------------------|--------------------------|
| Firebase Auth  | `services/firebase.ts`                | Google sign-in           |
| Gemini AI      | `services/gemini.ts` + backend        | AI responses             |
| Translate      | `services/translate.ts`               | UI translation           |
| Maps           | `services/maps.ts` + `MapEmbed.tsx`   | Polling booth locator    |
| Calendar       | `services/calendar.ts`                | Voting reminders         |
| Firebase Store | `services/firebase.ts`                | Certificate uploads      |
| Analytics      | `services/analytics.ts`               | Page tracking            |

> All services are **placeholder-safe**: they ship with mocks so the app runs without real keys. Replace stubs with live SDK calls when keys are configured.

---

## 9. Testing Plan

### Automated
```bash
# Backend
cd backend && npm test       # vitest + supertest

# Frontend
cd frontend && npm test      # vitest + testing-library
```

**Backend** ships **contract + regression** coverage alongside health checks: Zod validators (`translateBodySchema`, `chatSchema`), `GET /api` surface, **`entity.too.large` → HTTP 413** for oversized payloads, and Helmet security headers.  
**Frontend** includes **Accessibility** assertions (e.g. `<nav aria-label>` landmark and controls labelled for screen readers).

### Manual Smoke Test
1. Open the landing page → verify hero + animated cards.
2. Login as `admin@votewise.ai / Admin@123`.
3. Visit **AI Assistant** → ask "I am a first-time voter, how do I register?" → expect role-aware step list.
4. Try a **biased prompt** like "which party should I vote for?" → assistant must **refuse politely**.
5. Open **Timeline** → scroll through 8 stages with animation.
6. Open **Voter Checklist** → tick items → see progress %.
7. Take **Quiz** → submit → see certificate.
8. Open **Admin Dashboard** → add a FAQ → see it appear on the public list.
9. Open **Accessibility Panel** → toggle dyslexia / high-contrast / font size.
10. Open **Evaluation Matrix** → verify scorecard renders.

---

## 10. Security Notes

- **JWT** (HS256) with 7-day expiry, signed by `JWT_SECRET`.
- **bcrypt** with 12 salt rounds.
- **Helmet** for HTTP headers.
- **express-rate-limit** (100 req / 15 min per IP, 20 req / 5 min on `/auth`).
- **Zod** validates every body / param.
- **Role-based access control** (`requireRole('admin')`).
- **Neutrality Guardrails** intercept biased / persuasive prompts before reaching Gemini.
- CORS locked to `FRONTEND_URL`.
- No secrets in the repo — `.env.example` only.

---

## 11. Deployment (Google Cloud Run)

```bash
# Backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/votewise-api ./backend
gcloud run deploy votewise-api --image gcr.io/$PROJECT_ID/votewise-api --platform managed

# Frontend (via Firebase Hosting)
cd frontend && npm run build
firebase deploy --only hosting
```

---

## 12. Future Improvements

- Real Gemini API streaming responses
- True RAG with Vertex AI vector search over Election Commission documents
- WhatsApp / SMS reminders via Twilio
- Offline-first PWA mode
- Sign Language video explainers
- Civic-impact analytics dashboard for educators
- Multi-tenant support (per state/district)

---

## License

MIT — built for educational, non-partisan civic empowerment. 🗳️
