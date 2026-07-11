# AI Job Search UI

A web app for AI-assisted job search workflows. Upload your CV as a structured profile, use it as the **source of truth** for tailoring applications, and paste job descriptions to analyze keywords and required skills. A job scraper marketplace is planned for browsing and managing job sources.

## Features

### CV page (`/cv`)

Two Chrome-style tabs:

| Tab | Status | Description |
| --- | --- | --- |
| **Import** | Ready | Upload a PDF resume, parse it with Google Gemini, preview the extracted profile, and manage a library of saved CVs. |
| **Generate** | In progress | Shows the active CV and a job-description textarea. Keyword/skill analysis and tailored CV generation are next. |

**Import tab**

- Drag & drop or browse for PDF (max 10 MB)
- Structured extraction: personal info, summary, skills, experience, education, languages, certifications
- Strict parse prompt — Gemini must not invent data; empty fields stay empty
- CV library with active selection and delete
- Profile preview marked as “source of truth”
- Parsed profiles saved per browser session in Supabase

**Generate tab**

- Active CV indicator (or prompt to import one first)
- Job description textarea for postings from LinkedIn, Indeed, InfoJobs, company careers pages, etc.
- Text persisted in `localStorage` (up to 50,000 characters)
- Store and types prepared for upcoming keyword/skill analysis

### Job Scraper Market (`/job-scraper-market`)

Placeholder page for browsing and managing job scraping sources (coming soon).

### App shell

- Dark theme with semantic design tokens
- Collapsible sidebar and mobile drawer
- English / Spanish UI with language switcher
- Session-scoped API access via `X-Session-Id` (UUID v4 in `localStorage`)

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Zustand |
| Backend | Hono (Node), Google Gemini (`gemini-3.5-flash`), Supabase (PostgreSQL) |
| Tooling | Oxlint, concurrently, wait-on |

## Architecture

```
Browser (React)
  ├── Zustand stores
  │     ├── cvStore          — CV records, active CV, upload state
  │     └── jobDescriptionStore — job text + future analysis
  ├── localStorage           — session ID, active CV ID, job description, language
  └── /api/* (Vite proxy) ──► Hono API (:3001)
                                  ├── Gemini  — PDF → structured JSON
                                  └── Supabase — cv_profiles table
```

**Session model (MVP):** Each browser gets a UUID stored in `localStorage`. All CV CRUD is scoped to that `session_id`. There is no user authentication yet.

## Getting started

### Prerequisites

- Node.js 20+
- [Google Gemini API key](https://aistudio.google.com/apikey)
- [Supabase](https://supabase.com) project

### Install

```bash
npm install
npm install --prefix server
```

### Database

Run the SQL migrations in your Supabase SQL editor (in order):

1. `supabase/migrations/001_cv_profiles.sql` — creates `cv_profiles` table
2. `supabase/migrations/002_disable_rls.sql` — only needed if the table was created before RLS was disabled in `001`

### Configure the server

```bash
cp server/.env.example server/.env
```

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Google Gemini API key for CV parsing |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Service role secret** — server-side only; never expose to the frontend |
| `PORT` | API port (default `3001`) |
| `FRONTEND_URL` | Frontend origin for CORS (default `http://localhost:5173`) |

### Run locally

Start the API first, then Vite (handled automatically):

```bash
npm run dev
```

- Web app: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3001](http://localhost:3001) (proxied at `/api` in dev)

Or run separately:

```bash
npm run dev:server   # Hono API with hot reload
npm run dev:web      # Vite only (API must already be running)
```

### Build & lint

```bash
npm run build
npm run lint
npm run preview      # preview production build
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/api/cv` | List saved CV profiles for the session |
| `POST` | `/api/cv/parse` | Upload a PDF (`multipart/form-data`, field `file`) and parse + save |
| `DELETE` | `/api/cv/:id` | Delete a saved CV profile |

All `/api/cv` routes require header `X-Session-Id: <uuid-v4>`.

## Project structure

```
├── src/                          # React frontend
│   ├── components/
│   │   ├── cv/                   # CV tabs, upload, library, preview, job description
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── hooks/                    # useCvProfiles, useJobDescription, useTranslation
│   ├── i18n/                     # en/es translations
│   ├── pages/                    # CV, JobScraperMarket
│   ├── services/                 # API client (cvProfileService)
│   ├── stores/                   # Zustand (cvStore, jobDescriptionStore)
│   ├── types/                    # CV profile & job description types
│   └── utils/                    # session, PDF validation, API client
├── server/                       # Hono API
│   └── src/
│       ├── routes/               # cv routes
│       ├── services/             # Gemini, Supabase, CV persistence
│       ├── middleware/           # session validation
│       ├── schemas/              # Gemini JSON schema
│       ├── prompts/              # LLM prompts (anti-hallucination rules)
│       └── validators/
├── supabase/migrations/          # SQL schema
└── .cursor/rules/                # Cursor agent conventions
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start API, wait for `/health`, then Vite |
| `npm run dev:web` | Vite dev server only |
| `npm run dev:server` | Hono API with hot reload |
| `npm run build` | Type-check and build frontend |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview production build |

## Roadmap

- [ ] Analyze job descriptions (keywords, required skills) via Gemini
- [ ] Generate tailored CV from active profile + job description (no hallucination)
- [ ] Job Scraper Market
- [ ] Optional: migrate from `session_id` to Supabase Auth / `user_id`

## Public repository safety

**Verdict: safe to publish** the tracked source code, with the checklist below.

### What is already safe

| Check | Status |
| --- | --- |
| `server/.env` in `.gitignore` | Yes |
| `server/.env` tracked in git | No — only `server/.env.example` (placeholders) |
| Secrets hardcoded in source | No — keys read from `process.env` |
| `node_modules/`, `dist/` ignored | Yes |
| Service role key used server-side only | Yes — not sent to the browser |

### Before you push to a public repo

1. **Confirm `.env` is not staged:** `git status` must not list `server/.env`.
2. **Rotate credentials** if they were ever pasted in chat, screenshots, or an old commit — regenerate Gemini and Supabase service-role keys.
3. **Never commit** `server/.env`, API keys, or Supabase secret keys.
4. **Add a license** if you want others to know usage terms (no `LICENSE` file yet).

### Security limitations (by design in this MVP)

These are not blockers for open-sourcing the code, but matter if you **deploy** a public instance:

- **No user authentication** — isolation is a client-generated session UUID, not a login.
- **RLS disabled** on `cv_profiles` — access control is enforced in the API (`session_id` filter), not at the database row level.
- **No rate limiting** on upload/parse endpoints — add before exposing to untrusted traffic.
- **CORS** is restricted to `FRONTEND_URL` — set this correctly in production.
- **CV PDFs** are sent to Google Gemini — review [Google’s data policies](https://ai.google.dev/gemini-api/terms) for your use case.

Self-hosting is the expected model: each user runs their own API with their own `.env` and Supabase project.

## License

Not specified yet. Add a `LICENSE` file before publishing if you want to define terms.
