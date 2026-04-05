# AlphaX Programming

Bilingual (Amharic / English) learning platform for **C++** and **web fundamentals** (HTML, CSS, JavaScript): structured reading lessons, placement tests, chapter quizzes, module finals, verified certificates, a live compiler, gamification (XP, streaks, coins), and an AI tutor.

This repository is an **npm workspaces** monorepo:

| Package    | Stack                          | Role |
|-----------|---------------------------------|------|
| `frontend` | Next.js (App Router), React, Tailwind | Marketing site, lessons, dashboard, compiler UI, admin |
| `backend`  | Express, MySQL, JWT             | Auth, progress, quizzes, certificates, compiler proxy, AI tutor API |

## Prerequisites

- **Node.js** 20+ (recommended)
- **MySQL** 8+ (local or remote) for the backend

## Quick start

From the repository root:

```bash
npm install
```

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DB_* credentials, JWT_SECRET, optional GEMINI_API_KEY / SMTP
npm run dev
```

Runs the API on `http://localhost:4000` by default. Run database migrations as needed (see `backend/package.json` scripts: `migrate:001` … `migrate:006`, `seed:course-track-quizzes`, etc.).

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Ensure NEXT_PUBLIC_API_URL matches your backend (default http://localhost:4000)
npm run dev
```

Runs the Next.js dev server on `http://localhost:3000` (Turbopack).

### Root shortcuts

```bash
npm run dev:backend   # same as npm run dev --workspace=backend
npm run dev:frontend  # same as npm run dev --workspace=frontend
```

## Environment variables

- **Frontend** (`frontend/.env.local`): `NEXT_PUBLIC_API_URL` — backend base URL.
- **Backend** (`backend/.env`): `PORT`, `FRONTEND_URL`, `JWT_SECRET`, MySQL `DB_*`, optional `GEMINI_API_KEY` / `OPENAI_API_KEY` for the AI tutor, optional `SMTP_*` for email.

See `frontend/.env.example` and `backend/.env.example` for full lists.

## Project layout

```
fyr/
├── frontend/          # Next.js app
│   ├── app/           # Routes (public marketing, auth lessons, compiler, admin, …)
│   ├── components/    # UI (lessons, layout, …)
│   ├── content/       # Lesson text: chapter1–4 (C++), web (HTML/CSS/JS)
│   └── lib/           # Curriculum metadata, API client, utilities
├── backend/           # Express API
│   ├── modules/       # Feature routers (auth, compiler, quizzes, certificates, …)
│   ├── db/            # Migrations, connection
│   └── scripts/       # Seeds, diagnostics, migrations runners
└── package.json       # Workspaces root
```

Lesson content is plain text under `frontend/content/`; curriculum IDs and chapter structure live in `frontend/lib/courseCurriculum.ts`.

## Scripts (high level)

**Frontend:** `npm run dev`, `npm run build`, `npm run lint` — plus optional `extract:*` / `split:*` scripts for regenerating chapter text from source docs (maintainers).

**Backend:** `npm run dev`, `npm run build`, `npm start`, plus migrations and seeds (see `backend/package.json`).

More detail: [`frontend/README.md`](frontend/README.md).

## License

Private / all rights reserved unless otherwise stated by the project owners.
