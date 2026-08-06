# AI Job Search UI

A web app for AI-assisted job search workflows. Upload your CV as a structured profile, use it as the **source of truth** for tailoring applications, analyze job descriptions for keywords and skills, check profile compatibility (including location eligibility), and export a tailored CV as PDF.

## Features

### CV page (`/cv`)

Two Chrome-style tabs:

| Tab | Status | Description |
| --- | --- | --- |
| **Import** | Ready | Upload a PDF resume, parse it with Google Gemini, preview the extracted profile, and manage a library of saved CVs. |
| **Generate** | Ready | Analyze job postings, score profile fit, generate a tailored CV, preview it, and download a PDF. |

**Import tab**

- Drag & drop or browse for PDF (max 4 MB)
- Structured extraction: personal info, summary, skills, experience, education, languages, certifications
- Strict parse prompt — Gemini must not invent data; empty fields stay empty
- CV library with active selection and delete
- Profile preview marked as “source of truth”
- Parsed profiles saved per authenticated user in Supabase

**Generate tab**

- Active CV indicator (or prompt to import one first)
- Job description textarea for postings from LinkedIn, Indeed, InfoJobs, company careers pages, etc. (50–50,000 characters, persisted in `localStorage`)
- **Output language** selector: English (default) or Spanish — affects summary, bullets, and PDF section headers; skill/tech names stay unchanged
- **Analyze** — extracts keywords, required/preferred skills, and (when an active CV is set) profile compatibility:
  - Animated score ring with skills match vs final score (location penalty applied)
  - Strengths, gaps, and location eligibility (e.g. remote policy, country restrictions)
- **Generate tailored CV** — rewrites and reorders content from the source profile only; no invented skills or experience
- Tailored CV preview with adaptation notes (matched keywords/skills, gaps)
- PDF viewer and download via `@react-pdf/renderer`

### Job Scraper Market (`/job-scraper-market`)

Placeholder page for browsing and managing job scraping sources (coming soon).

### App shell

- Dark theme with semantic design tokens
- Collapsible sidebar and mobile drawer
- English / Spanish UI with language switcher
- Supabase email/password authentication with server-side JWT verification

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Zustand, `@react-pdf/renderer` |
| Backend | Hono (Node), Google Gemini (`gemini-3.1-flash-lite` default), Supabase (PostgreSQL) |
| Tooling | Oxlint, concurrently, wait-on |

## Architecture

```
Browser (React)
  ├── Zustand stores
  │     ├── cvStore              — CV records, active CV, upload state
  │     ├── jobDescriptionStore  — job text (localStorage)
  │     └── generateStore        — analysis, compatibility, tailored CV, loading/errors
  ├── Supabase Auth              — login session and JWT
  ├── localStorage               — active CV ID, job description, output language
  └── /api/* ──► Hono API (Vercel Functions in production)
                  ├── Gemini   — parse, analyze, compatibility, tailor
                  └── Supabase — cv_profiles table
```

**Anti-hallucination:** The parsed `CVProfile` is the source of truth. Tailored CV generation only reorders and rewrites existing content — it does not add skills, roles, or experience that are not in the profile.

**Authentication model:** Supabase Auth issues a JWT that the API verifies on every `/api/cv/*` request, and CV rows are scoped to the authenticated `user_id`.

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
2. `supabase/migrations/002_disable_rls.sql` — legacy compatibility migration
3. `supabase/migrations/003_auth_and_rls.sql` — adds `user_id` and enables fail-closed RLS

Then open Supabase Dashboard → Authentication → Users and create your personal user. Disable public user signups in the Supabase Auth settings because the application only provides sign-in, not registration.

On the first authenticated CV list request, records saved by the previous browser-session implementation are automatically claimed by the authorized user when the legacy UUID is still present in that browser.

### Configure the server

```bash
cp server/.env.example server/.env
```

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Google Gemini API key for all LLM features |
| `GEMINI_MODEL` | Optional. Model ID override (default `gemini-3.1-flash-lite`). See [Gemini models](#gemini-models--quota) below. |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Service role secret** — server-side only; never expose to the frontend |
| `PORT` | API port (default `3001`) |
| `FRONTEND_URL` | Frontend origin for CORS (default `http://localhost:5173`) |
| `FRONTEND_URLS` | Optional comma-separated origins; takes precedence over `FRONTEND_URL` |

### Configure the frontend

Copy `.env.example` to `.env` and set:

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API origin. Leave empty when using the local Vite proxy; use the backend Vercel URL in production. |
| `VITE_SUPABASE_URL` | Supabase project URL used for authentication |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable/anon key; never use `service_role` here |
| `VITE_DEV_MOCK_GENERATE` | Optional local generation mocks |

### Gemini models & quota

New Gemini API accounts **cannot** use legacy models such as `gemini-2.5-flash` or `gemini-2.0-flash` (they return 404).

| Model | Notes |
| --- | --- |
| `gemini-3.1-flash-lite` | **Default** — best choice for free tier volume |
| `gemini-3.5-flash` | Automatic fallback if the primary model is unavailable; very low free-tier quota (~20 requests/day) |

The server retries on quota errors (429) and falls back to the next model on 404. Set `GEMINI_MODEL` in `server/.env` to override the default.

**API usage per action:**

| Action | Gemini calls |
| --- | --- |
| Import PDF | 1 |
| Analyze job (with active CV) | 2 (job analysis + compatibility) |
| Analyze job (no CV) | 1 |
| Generate tailored CV | 1 |

On the free tier, quota can be consumed quickly — especially when analyzing with an active CV.

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

## Deploy to Vercel

Create two Vercel projects from the same repository.

### 1. Backend project

- Root Directory: `server`
- Framework Preset: Hono
- Build settings: use the detected defaults
- Environment variables: `GEMINI_API_KEY`, optional `GEMINI_MODEL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `FRONTEND_URL`

`server/src/index.ts` is the Vercel entry point. `server/src/dev.ts` only opens a Node port for local development. Function duration is configured to 300 seconds in `server/vercel.json` for Gemini requests.

### 2. Frontend project

- Root Directory: repository root
- Framework Preset: Vite
- Environment variables: `VITE_API_URL` (the backend project URL), `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and optionally `VITE_DEV_MOCK_GENERATE=false`

After the frontend receives its production URL, set that exact origin as `FRONTEND_URL` in the backend project and redeploy it. Use `FRONTEND_URLS` when more than one stable frontend origin is required. The root `vercel.json` provides the React Router SPA fallback.

In the backend project's Vercel Firewall, add the single Hobby rate-limit rule to the expensive API paths (`/api/cv/parse`, `/api/cv/analyze-job`, `/api/cv/tailor`, and `/api/cv/cover-letter`). A fixed window such as 20 requests per minute per IP is ample for personal use.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` in variables prefixed with `VITE_`.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/api/cv` | List saved CV profiles for the authenticated user |
| `POST` | `/api/cv/parse` | Upload a PDF (`multipart/form-data`, field `file`) and parse + save |
| `PATCH` | `/api/cv/:id` | Update a saved CV profile |
| `DELETE` | `/api/cv/:id` | Delete a saved CV profile |
| `POST` | `/api/cv/analyze-job` | Analyze job description; optional `sourceProfile` for compatibility scoring |
| `POST` | `/api/cv/tailor` | Generate tailored CV from `sourceProfile`, `jobDescription`, `analysis`, and optional `outputLanguage` (`en` \| `es`) |

All `/api/cv` routes require `Authorization: Bearer <supabase-access-token>`. The frontend adds it automatically.

PDF files are limited to 4 MB so the complete multipart request remains below Vercel's 4.5 MB function payload limit.

**`POST /api/cv/analyze-job` body:**

```json
{
  "jobDescription": "…",
  "sourceProfile": { }
}
```

`sourceProfile` is optional. When omitted, only job analysis is returned.

**`POST /api/cv/tailor` body:**

```json
{
  "sourceProfile": { },
  "jobDescription": "…",
  "analysis": { },
  "outputLanguage": "en"
}
```

## Project structure

```
├── src/                          # React frontend
│   ├── components/
│   │   ├── cv/                   # Import/Generate tabs, PDF, compatibility, previews
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── hooks/                    # useCvProfiles, useCvGeneration, useJobDescription, …
│   ├── i18n/                     # en/es translations
│   ├── pages/                    # CV, JobScraperMarket
│   ├── services/                 # cvProfileService, cvGenerateService
│   ├── stores/                   # cvStore, jobDescriptionStore, generateStore
│   ├── types/                    # CV profile, job description, tailored CV, compatibility
│   └── utils/                    # API client, PDF validation, downloadCvPdf, cvPdfLabels
├── server/                       # Hono API
│   └── src/
│       ├── routes/               # cv + generate routes
│       ├── services/             # Gemini, Supabase, CV persistence
│       ├── middleware/           # Supabase JWT authentication
│       ├── schemas/              # Gemini JSON schemas
│       ├── prompts/              # parse, analyze, compatibility, tailor prompts
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

- [x] Analyze job descriptions (keywords, required skills) via Gemini
- [x] Profile compatibility scoring (skills + location eligibility)
- [x] Generate tailored CV from active profile + job description (no hallucination)
- [x] PDF export for tailored CV
- [x] Output language selection (English / Spanish)
- [ ] Combine analyze + compatibility into a single Gemini call (reduce quota usage)
- [ ] Job Scraper Market
- [x] Supabase Auth, `user_id` isolation, and RLS

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

### Deployment security

These are not blockers for open-sourcing the code, but matter if you **deploy** a public instance:

- **Authentication required** — the API verifies Supabase JWT signatures before serving protected routes.
- **RLS enabled** — browser keys have no table policies; persistence uses the server-only service role after authentication.
- **Rate limiting is platform configuration** — publish the documented Vercel WAF rule after deploying the backend.
- **CORS** is restricted to `FRONTEND_URL` — set this correctly in production.
- **CV PDFs and job descriptions** are sent to Google Gemini — review [Google’s data policies](https://ai.google.dev/gemini-api/terms) for your use case.

Self-hosting is the expected model: each user runs their own API with their own `.env` and Supabase project.

## License

Not specified yet. Add a `LICENSE` file before publishing if you want to define terms.
