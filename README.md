# Kushagra Sinha — Portfolio

Personal portfolio site with a RAG-powered chatbot that answers questions about my experience using my resume as the knowledge base.

**Live**: [sinhakushagra21.github.io](https://sinhakushagra21.github.io) (after deploy)

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

### `frontend/.env.local`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL of the FastAPI backend, e.g. `https://your-render-service.onrender.com` |

---

## Updating the Knowledge Base (Resume Changes)

When you update your resume:

1. Drop the new PDF at `backend/data/resume.pdf`
2. Run `cd backend && make embed`
3. Commit `backend/data/knowledge_base.json`
4. Push — Render redeploys automatically, picks up the new JSON

The embedding script (`backend/scripts/build_embeddings.py`) parses the PDF by section headers and embeds each chunk independently. Chunks: About, Tesla, Qualcomm, Zomato, Bluestone, FitGen.AI, Skills, Education.

---

## Deployment

### Backend → Render

1. Create a new **Web Service** at [render.com](https://render.com)
2. Connect this repo, set root directory to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `OPENAI_API_KEY=sk-...`
6. After deploy, copy the service URL (e.g. `https://kushagra-portfolio.onrender.com`)

### Frontend → Vercel

1. Import this repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `frontend/`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com`
4. Also set `ALLOWED_ORIGINS` in Render to your Vercel domain

Vercel auto-deploys on every push to `main`.

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
