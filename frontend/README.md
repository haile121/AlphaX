# AlphaX Programming — Frontend

Next.js app for the marketing site, learner dashboard, lessons, compiler UI, and admin tools.

## Setup

```bash
npm ci
cp .env.example .env.local
# Edit .env.local if your API is not at http://localhost:4000
```

## Scripts

| Command        | Description        |
|----------------|--------------------|
| `npm run dev`  | Dev server (Turbopack) |
| `npm run build`| Production build   |
| `npm run start`| Run production build |

## Environment

- `NEXT_PUBLIC_API_URL` — Base URL of the backend (see `.env.example`).

The backend repo is separate; this frontend expects cookie-based auth against that API when using authenticated routes.
