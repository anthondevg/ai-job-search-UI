# AI Job Search UI

A web app for AI-assisted job search workflows. Upload your CV as a structured profile, then use it as the source of truth for tailoring applications. A job scraper marketplace is planned for browsing and managing job sources.

## Features

- **Generate/CV** — Upload a PDF resume and extract a structured profile (personal info, summary, skills, experience) using Google Gemini. Parsed profiles are saved per session in Supabase.
- **Job Scraper Market** — Placeholder for browsing and managing job scraping sources (coming soon).
- **Internationalization** — English and Spanish UI with a language switcher.
- **Responsive layout** — Collapsible sidebar and mobile-friendly navigation.

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router |
| Backend | Hono (Node), Google Gemini, Supabase |
| Tooling | Oxlint, concurrently |

## Getting started

### Prerequisites

- Node.js 20+
- A [Google Gemini API key](https://aistudio.google.com/apikey)
- A [Supabase](https://supabase.com) project with a `cv_profiles` table

### Install

```bash
npm install
npm install --prefix server
```

### Configure the server

Copy the example env file and fill in your credentials:

```bash
cp server/.env.example server/.env
```

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Google Gemini API key for CV parsing |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `PORT` | API port (default `3001`) |
| `FRONTEND_URL` | Frontend origin for CORS (default `http://localhost:5173`) |

### Run locally

Start the frontend and API together:

```bash
npm run dev
```

- Web app: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3001](http://localhost:3001) (proxied via Vite at `/api`)

Or run them separately:

```bash
npm run dev:web      # Vite only
npm run dev:server   # Hono API only
```

### Build

```bash
npm run build
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/api/cv` | List saved CV profiles for the session |
| `POST` | `/api/cv/parse` | Upload a PDF and parse + save the profile |
| `DELETE` | `/api/cv/:id` | Delete a saved CV profile |

All `/api/cv` routes require an `X-Session-Id` header (UUID v4).

## Project structure

```
├── src/                  # React frontend
│   ├── components/       # UI components (layout, CV upload, preview)
│   ├── hooks/            # React hooks (CV upload, i18n)
│   ├── i18n/             # Translations (en, es)
│   ├── pages/            # Route views
│   ├── services/         # API client
│   └── utils/            # Helpers (PDF validation, etc.)
└── server/               # Hono API
    └── src/
        ├── routes/       # HTTP routes
        ├── services/     # Gemini, Supabase, CV persistence
        ├── schemas/      # Gemini JSON schema for CV profiles
        └── prompts/      # LLM prompts
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start frontend + API |
| `npm run dev:web` | Start Vite dev server |
| `npm run dev:server` | Start API with hot reload |
| `npm run build` | Type-check and build frontend |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview production build |
