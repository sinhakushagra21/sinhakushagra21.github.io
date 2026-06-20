# Portfolio Site — Implementation Plan

## Blocker / Clarification

- **`getdesign add claude`** drops a `DESIGN.md` design token reference (colors, typography, spacing, component specs), **not** actual React components. We'll use it as the design system source of truth and build the chat UI with shadcn/ui primitives styled to match. This is actually better — we get full control over the chat shell.
- **Resume PDF**: need a file for the download link, or a placeholder path to wire up.

---

## Tech Choices with Reasoning

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 15 App Router | Your spec. SSR for SEO, route handlers for API, Vercel-native. |
| Styling | Tailwind v4 + shadcn/ui | Your spec. DESIGN.md tokens map directly to Tailwind CSS variables. |
| Chat streaming | Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) | First-class streaming, built-in `useChat` hook, handles SSE plumbing. |
| LLM | Claude claude-sonnet-4-20250514 | Latest Sonnet. Best cost/quality for conversational RAG. |
| Embeddings | OpenAI `text-embedding-3-small` | $0.02/1M tokens, 1536 dims, excellent quality. One fewer vendor than Voyage (which needs a separate SDK). For ~40 chunks, total embed cost is <$0.01. |
| Vector store | In-memory cosine similarity over `data/knowledge-base.json` | Corpus is ~40 chunks. No DB needed. JSON loads at cold start, stays in memory. |
| Rate limiting | In-memory Map (IP → timestamps) | No external dependency. Resets on cold start, which is fine for v1. Upstash adds complexity for zero benefit at this traffic level. |
| Design system | `DESIGN.md` from getdesign claude | Tokens (colors, typography, spacing) mapped to Tailwind CSS variables. We use Inter (free) for body and Cormorant Garamond or EB Garamond (free Google Fonts) for display serif, since Copernicus/StyreneB are proprietary Anthropic fonts. |
| Dark/light mode | `next-themes` | 3KB, handles system preference, localStorage persistence, no flash. |
| Markdown rendering | `react-markdown` + `rehype-highlight` | Renders chatbot markdown responses with syntax-highlighted code blocks. |
| Deployment | Vercel | Your spec. Zero-config for Next.js, edge functions, environment variables. |

---

## File Structure

```
├── DESIGN.md                          # Design tokens from getdesign (reference)
├── PLAN.md                            # This file
├── README.md                          # Setup, env vars, deploy, update KB
├── data/
│   ├── knowledge-base.md              # Raw content (you fill this)
│   └── knowledge-base.json            # Embedded chunks (generated, committed)
├── scripts/
│   └── build-embeddings.ts            # Reads .md → chunks → embeds → writes .json
├── public/
│   └── resume.pdf                     # Resume download (you provide)
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout, fonts, theme provider
│   │   ├── page.tsx                   # Single page: hero + chat + sections
│   │   ├── globals.css                # Tailwind + DESIGN.md CSS variables
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts           # POST: embed query → retrieve → stream Claude
│   ├── components/
│   │   ├── chat/
│   │   │   ├── chat-container.tsx     # Main chat shell (useChat, message list, input)
│   │   │   ├── chat-message.tsx       # Single message bubble (markdown, copy btn)
│   │   │   ├── chat-input.tsx         # Input bar with send button
│   │   │   ├── starter-prompts.tsx    # Clickable chip suggestions
│   │   │   └── sources-expander.tsx   # Collapsible retrieved chunks under answer
│   │   ├── sections/
│   │   │   ├── hero.tsx               # Name, pitch, chat input as CTA
│   │   │   ├── experience.tsx         # Timeline: Tesla → Qualcomm → Zomato → Bluestone
│   │   │   ├── projects.tsx           # Featured projects (Tesla work, FitGen.AI)
│   │   │   ├── skills.tsx             # Grouped skill badges
│   │   │   ├── education.tsx          # Northeastern + PES
│   │   │   └── contact.tsx            # Email, LinkedIn, GitHub, phone
│   │   ├── layout/
│   │   │   ├── navbar.tsx             # Minimal top nav
│   │   │   ├── footer.tsx             # Links + resume download
│   │   │   └── theme-toggle.tsx       # Dark/light switch
│   │   └── ui/                        # shadcn/ui primitives (button, card, etc.)
│   └── lib/
│       ├── rag/
│       │   ├── retrieve.ts            # Load JSON, cosine similarity, return top-k
│       │   ├── embed.ts               # Call OpenAI embeddings API
│       │   └── system-prompt.ts       # Chatbot system prompt (first person, etc.)
│       ├── rate-limit.ts              # In-memory IP rate limiter
│       └── types.ts                   # Shared types (Chunk, KnowledgeBase, etc.)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local.example                 # Template for env vars
```

---

## Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...          # Claude API key (for generation)
OPENAI_API_KEY=sk-...                 # OpenAI API key (for embeddings only)
```

Only two secrets. Both stay server-side in route handlers. Never shipped to client.

---

## Data Flow

### Build-Time: Ingest → Embed → Store

```
data/knowledge-base.md
        │
        ▼
scripts/build-embeddings.ts
  1. Read markdown file
  2. Split on ## headings (one chunk per section)
  3. For each chunk:
     - Extract metadata: title (heading text), category (experience/project/skill/etc.)
     - Call OpenAI text-embedding-3-small → 1536-dim vector
  4. Write to data/knowledge-base.json:
     [
       {
         "id": "tesla-intern",
         "title": "Tesla, Software Engineer Intern",
         "category": "experience",
         "content": "I interned at Tesla on the Workbench team...",
         "embedding": [0.012, -0.034, ...]
       },
       ...
     ]
  5. Commit the JSON to repo. Re-run only when content changes.
```

**Run**: `npm run build:embeddings`

### Request-Time: Query → Retrieve → Generate → Stream

```
User types question in chat
        │
        ▼
Client: useChat() → POST /api/chat { messages }
        │
        ▼
Route handler:
  1. Rate limit check (IP → in-memory map, 10 msg/hr)
  2. Extract latest user message
  3. Embed the question (OpenAI text-embedding-3-small)
  4. Load knowledge-base.json (cached in module scope after first load)
  5. Cosine similarity against all chunks
  6. Take top k=5 chunks
  7. Build system prompt:
     - "You are Kushagra. Speak in first person..."
     - "Here are relevant facts about me: [top-5 chunks]"
     - "If the answer isn't in these facts, say so honestly."
  8. Call Claude claude-sonnet-4-20250514 via @ai-sdk/anthropic with streaming
  9. Stream tokens back via Vercel AI SDK's StreamingTextResponse
  10. Include retrieved chunk metadata in a custom header or
      data stream annotation for the sources expander
        │
        ▼
Client: useChat() streams tokens into chat-message component
         Sources expander reads annotation data
```

---

## System Prompt (Draft)

```
You are Kushagra Sinha. You're a backend software engineer answering questions
about your experience, skills, and projects on your portfolio site. Speak in
first person. Be casual and direct — like a senior engineer in a coffee chat.
No corporate jargon, no filler phrases.

Use ONLY the context provided below to answer. If the question isn't covered
by the context, say "I don't have that in my background info — feel free to
email me at kushagra.211198@gmail.com and I'll answer directly."

Do not help with essays, homework, coding problems, or anything unrelated to
your portfolio. Politely redirect: "This is my portfolio chatbot — I can only
talk about my experience and work. What would you like to know about me?"

You can give opinions about technologies you've used when asked.

CONTEXT:
{retrieved_chunks}
```

---

## Rate Limiting Design

```typescript
// In-memory map: IP → array of timestamps
const requests = new Map<string, number[]>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const limit = 10;

  const timestamps = (requests.get(ip) || []).filter(t => now - t < window);
  if (timestamps.length >= limit) {
    const oldestInWindow = timestamps[0];
    return { allowed: false, remaining: 0, resetIn: Math.ceil((oldestInWindow + window - now) / 1000) };
  }
  timestamps.push(now);
  requests.set(ip, timestamps);
  return { allowed: true, remaining: limit - timestamps.length, resetIn: 0 };
}
```

Friendly message when hit: "I've hit my message limit for this hour — I can only handle 10 questions per hour to keep API costs sane. Try again in X minutes, or email me directly."

---

## Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Set `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` in Vercel environment variables
4. Vercel auto-deploys on push to main
5. Custom domain: configure in Vercel dashboard (or use default `.vercel.app`)

---

## Build Order

1. **Scaffold**: Next.js 15 + Tailwind + shadcn/ui + DESIGN.md tokens → CSS variables
2. **Layout shell**: Root layout, fonts (Inter + Cormorant Garamond), theme provider, navbar, footer
3. **Knowledge base**: `data/knowledge-base.md` with schema, `scripts/build-embeddings.ts`, generate JSON
4. **RAG backend**: `/api/chat` route handler (embed → retrieve → stream)
5. **Chat UI**: Chat container, messages (markdown + code), input, starter prompts, sources expander
6. **Hero section**: Name, pitch, chat input as the CTA
7. **Content sections**: Experience timeline, projects, skills, education, contact
8. **Polish**: Dark/light mode, responsive, accessibility, rate limit UX
9. **README**: Setup, env vars, KB update flow, deploy steps

---

## Standout Ideas

### 1. Thinking Indicator with Real Retrieval Transparency
**What**: While the chatbot retrieves and generates, show a "thinking" animation that displays the actual retrieval step — e.g., "Searching through 4 years of experience..." → "Found 5 relevant sections" → streaming answer. Like Claude's extended thinking, but for RAG retrieval.

**Tradeoff**: ~2 hours to build. Uses Vercel AI SDK's data stream protocol to send retrieval metadata before the answer stream. Recruiters see the AI actually working (builds trust), engineers see the RAG pipeline is real (builds credibility). Cost: zero — it's metadata, not extra API calls.

**Signal**: Shows you understand UX for AI systems, not just the backend.

### 2. "Ask me about this" Context Chips on Portfolio Sections
**What**: Each content section (experience, projects, skills) gets small clickable chips that pre-fill the chat with relevant questions. The Tesla section has "What was the hardest problem at Tesla?" and "How did you reduce inference cost by 35%?". These scroll the page to the chat and inject the question.

**Tradeoff**: ~1 hour. Zero cost. Makes the site interactive beyond the chat — recruiters who wouldn't think to use the chatbot get drawn in by specific, interesting questions attached to the content they're already reading. The questions themselves are a form of content (they highlight your best stories).

**Signal**: You thought about the recruiter's journey through the page, not just the tech.

### 3. Conversation Export / Share Link
**What**: A "Share this conversation" button that generates a static URL (stored as a base64-encoded JSON in the URL hash, no backend needed). Recruiters can send the link to hiring managers: "Look at what this candidate's chatbot said about their system design experience."

**Tradeoff**: ~3 hours. No cost (client-side only, URL hash storage). The URL gets long with many messages, but for 5-10 message conversations it's fine. Adds virality — every shared link is a portfolio visit for the hiring manager.

**Signal**: You understand distribution. The chatbot isn't just a demo; it's a tool recruiters actually use in their workflow.

### 4. Response Quality Guardrails with Confidence Scoring
**What**: For each answer, compute a simple confidence score: ratio of retrieved chunk relevance scores above a threshold. If confidence is low (question is far from any knowledge base content), the chatbot proactively says "I don't have strong coverage on that topic" before attempting an answer, rather than just saying "I don't know" or worse, hallucinating.

**Tradeoff**: ~1.5 hours. Zero cost (computed from existing cosine similarity scores). Shows you think about LLM reliability in production, which is exactly the kind of judgment call that senior AI SWE roles test for. Downside: might be overly cautious on valid questions that use different phrasing than the knowledge base.

**Signal**: Demonstrates production LLM thinking — the same reliability-first mindset you describe in your "How I work" section.

### 5. Mobile-First "Quick Profile" Mode
**What**: On mobile (or as a toggle), offer a card-stack view instead of the full page — swipeable cards showing one section each (About → Tesla → Qualcomm → ...) with a floating chat button. Recruiters on phones at career fairs or in between meetings get a fast scan without scrolling a long page.

**Tradeoff**: ~4-5 hours. Significantly more frontend work. The chat stays the same; it's just a different navigation paradigm for the portfolio content. Risk of scope creep. But mobile is where recruiters actually look at portfolios (LinkedIn link → phone browser), so optimizing for that path has real value.

**Signal**: You think about how users actually interact, not just how the page looks on a 27" monitor.

---

### Recommendation
Build ideas **1, 2, and 4** — they're cheap (combined ~4.5 hours), zero additional cost, and each demonstrates a different skill (AI UX, product thinking, reliability engineering). Idea 3 is a great v2 feature. Idea 5 is cool but high effort for a first launch.

---

## Ready to Build

Waiting for your sign-off on this plan. Specifically:
- Are the tech choices good, or do you want to swap anything?
- Which standout ideas (if any) should I include in v1?
- Do you have a resume PDF ready, or should I wire up a placeholder?
