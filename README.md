# Kushagra Sinha — Portfolio

Personal portfolio site with a RAG-powered chatbot that answers questions about my experience using my resume as the knowledge base.

**Live**: deployed on Vercel (frontend) + Render (backend) — see [Deployment](#deployment-free-tier). Custom domain: `kushagrasinha.me`.

---

## Architecture

```
frontend/   Next.js 15 + Framer Motion + Tailwind  →  Vercel
backend/    FastAPI (Python) + OpenAI RAG            →  Render
```

One API key covers everything: `OPENAI_API_KEY` (embeddings + generation).

---

## Local Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in OPENAI_API_KEY in .env

pip3 install -r requirements.txt

# Build the knowledge base from resume.pdf (one-time, re-run when resume changes)
make embed

# Start the API server
make dev
# → http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000  (already set)

npm install
npm run dev
# → http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) — the chat connects to the FastAPI backend automatically.

---

## Environment Variables

### `backend/.env`

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key — used for embeddings (text-embedding-3-small) and generation (gpt-4o-mini) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins, e.g. `https://yoursite.vercel.app` |
| `NOTES_VIEW_KEY` | Secret to view the private visitor-notes inbox at `GET /api/notes?key=…` (footer → "· notes") |

### `frontend/.env.local`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL of the FastAPI backend, e.g. `https://your-render-service.onrender.com` |

---

## Updating the Knowledge Base

The chatbot answers from curated markdown in `backend/data/knowledge/`
(`knowledge-base.md`, `project-details.md`, `project-deep-dives.md`) — far richer
and more accurate than the résumé. To update what the bot knows:

1. Edit the markdown in `backend/data/knowledge/` (and `RELOCATION_CHUNK` / `VISA_CHUNK` in the build script for logistics)
2. Run `cd backend && make embed`
3. Commit `backend/data/knowledge_base.json`
4. Push — Render redeploys and picks up the new embeddings (or restart the backend locally)

`build_embeddings.py` chunks the markdown by section heading and **strips
interview-prep meta** (Be-ready-to-answer blocks, `(confirm…)` notes,
`[placeholders]`, coaching asides) so none of that reaches a recruiter.

---

## Deployment (free tier)

> GitHub Pages **can't** host this — it needs Next.js SSR + a live FastAPI
> backend. Use Vercel (frontend) + Render (backend). Deploy the **backend first**
> so you have its URL for the frontend.

### 1. Backend → Render

This repo ships a `render.yaml` blueprint, so it's near one-click:

1. At [render.com](https://render.com): **New → Blueprint** → pick this repo (it reads `render.yaml`).
2. After it provisions, set the three secrets in the service's **Environment** tab:
   - `OPENAI_API_KEY` — your key
   - `ALLOWED_ORIGINS` — your Vercel URL (fill once the frontend is up)
   - `NOTES_VIEW_KEY` — a private secret for the notes inbox
3. Copy the service URL, e.g. `https://kushagra-portfolio-api.onrender.com`.

(Prefer manual setup? Root dir `backend`, build `pip install -r requirements.txt`,
start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.)

### 2. Frontend → Vercel

1. Import this repo at [vercel.com/new](https://vercel.com/new).
2. **Root Directory:** `frontend` (Next.js auto-detected).
3. Env var: `NEXT_PUBLIC_API_URL` = your Render URL from step 1.
4. Deploy → copy the `*.vercel.app` URL, then set it as `ALLOWED_ORIGINS` in Render and redeploy the backend (CORS).
5. In Vercel → project → **Analytics → Enable** (activates the built-in `@vercel/analytics`).

Vercel auto-deploys on every push to `main`.

### Notes

- **Render free sleeps** after ~15 min idle → the first chat after a quiet spell is slow (~30–60 s cold start). Keep it warm with a free pinger (UptimeRobot / cron-job.org) hitting `…onrender.com/health` every ~10 min.
- **Visitor notes are ephemeral** on Render free — `notes.json` resets on redeploy. Swap in a managed Postgres for durability.
- **Calendly** scheduling is configured in `frontend/lib/calendly.ts` (`CALENDLY_URL`).
- Only ongoing cost is OpenAI usage (tiny with `gpt-4o-mini` + the 10-req/hr limit).

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              FastAPI app + CORS
│   ├── rate_limit.py        In-memory IP rate limiter (10 req/hr)
│   ├── api/chat.py          POST /api/chat  — embed → retrieve → stream
│   └── rag/
│       ├── embed.py         OpenAI embedding wrapper
│       ├── retrieve.py      Cosine similarity search over knowledge_base.json
│       └── system_prompt.py First-person system prompt builder
├── scripts/
│   └── build_embeddings.py  PDF → semantic chunks → embeddings → JSON
└── data/
    ├── resume.pdf           Your resume (update this file)
    └── knowledge_base.json  Generated embeddings (commit this)

frontend/
├── app/
│   ├── layout.tsx           Fonts, ThemeProvider, metadata
│   ├── page.tsx             Single page assembly
│   └── globals.css          DESIGN.md tokens as CSS variables
├── components/
│   ├── chat/                ChatContainer, ChatMessage, ChatInput, StarterPrompts, SourcesExpander
│   ├── sections/            Hero, Experience, Projects, Skills, Education, Contact
│   └── layout/              Navbar, Footer, ThemeToggle
└── lib/
    ├── chat.ts              Streaming fetch client for FastAPI
    └── types.ts             Shared TypeScript types
```

---

## What's Next

With another day of work:

- **Conversation memory**: Persist chat history in `localStorage` so returning visitors pick up where they left off
- **Resume upload endpoint**: A password-protected `POST /admin/update-resume` that re-runs the embedding pipeline without a redeploy
- **Analytics**: Simple hit counter per question category — find out which topics recruiters ask about most
- **Response caching**: Hash question embeddings and cache answers for identical (or near-identical) questions to reduce OpenAI spend
- **OG image**: Dynamic OpenGraph image with name + tagline for link previews on LinkedIn shares
