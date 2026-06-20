# Project Details — Deep Dive (Products)

> Full architecture and mechanics of each product, grounded in the actual repositories — for a portfolio, an "ask-me-anything" assistant, or system-design talking points. Work-experience project deep-dives (Tesla, Qualcomm, Zomato, BlueStone) live in `project-deep-dives.md`.

---

# RolloutX — Distributed Feature-Flag Platform
**Stack:** Go, gRPC, PostgreSQL, Kafka, Redis, Prometheus, OpenTelemetry, Kubernetes, Terraform
**Repo:** github.com/sinhakushagra21/RolloutX

## What it is
A self-hostable feature-flag and progressive-rollout platform in the class of LaunchDarkly / Statsig / Unleash — designed for large flag counts and high read volume with sub-50ms evaluation, where flag evaluation happens **in-process inside the application** via an SDK, not over a network call per check.

## Architecture: control plane vs data plane
The system deliberately splits **control** (authoring) from **data** (evaluation) so that flag-editing traffic never contends with the high-volume read path.
- **Control plane** (gRPC, PostgreSQL): where flags, rules, and rollouts are authored, with RBAC and a hard production gate so developers can't push prod changes unguarded; every change is written with an immutable audit record.
- **Data plane** (stateless gRPC replicas): serves evaluation; horizontally scalable because it holds no mutable state — it evaluates against an immutable in-memory snapshot.

## How a change propagates (the integrity path)
The hard problem in feature flags is propagating config changes correctly without a dual-write bug (DB says one thing, cache/clients another). RolloutX solves it with a **transactional outbox**:
1. A flag change writes the **config row + the audit record + the outbox event in ONE database transaction.** Either all land or none do — no lost or invented change.
2. A relay publishes outbox events to **Kafka as immutable, versioned snapshots.**
3. **Redis** acts as an L2 cache with pub/sub invalidation for fast fan-out, paired with Kafka for durable reconciliation.
4. SDKs receive the new snapshot via a streaming service and swap it in atomically.

## How evaluation works (the fast path)
- The data plane / SDK holds an **immutable snapshot** of all flags. Evaluation is a **lock-free atomic load** of the current snapshot pointer plus pure computation — no locks, no I/O, so it scales linearly across cores.
- **Bucketing for % rollouts is deterministic and sticky:** `murmur3(flagKey + "." + salt + "." + bucketingKey) % 100000`. The same user always lands in the same bucket, and ramping a rollout up is **monotonic** (users who were in stay in). This is what makes a "10% rollout" actually mean a stable, uniform 10%.

## Reliability features
- **Sub-second kill switch** via a dual path: a Redis "hint" for instant propagation plus Kafka reconciliation for durability, so a bad flag can be disabled in well under a second.
- **Last-known-good bootstrap:** if the control plane or Kafka is down when an SDK starts, it boots from its last good snapshot and keeps evaluating — graceful degradation instead of an outage.
- **gRPC health probes + graceful shutdown** for clean rollout/rollback in Kubernetes.

## Services & SDK
- Control-plane gRPC (authoring), evaluation gRPC, and a streaming service for SDK updates.
- **Go SDK:** local in-process evaluation, streaming bootstrap, automatic reconnection with exponential backoff.

## Measured results
- **211 ns per evaluation** (~4.7M evaluations/sec per core); 129 ns/op aggregate under parallel benchmark (scales across cores over the immutable snapshot).
- Rollout distribution **within ±1% across 1,000,000 keys** (property test) — uniformity verified.
- Integration test: a 10% rollout enabled **10.1% of 50,000 users** end-to-end (determinism verified).
- **k6 load tests** enforcing p95 < 20ms, p99 < 50ms.

## Why it's strong
Real distributed-systems depth in Go: control/data-plane separation, the outbox pattern (avoids dual-write), immutable-snapshot lock-free reads, deterministic hashing, and production reliability primitives (kill switch, graceful degradation). Directly maps to cloud-infra / platform engineering roles.

---

# FITGEN.AI — Stateful Multi-Agent Fitness Coach
**Stack:** Python, LangGraph, OpenAI (GPT-5.1 planning / GPT-4.1-mini routing), MongoDB Atlas (+ Vector Search), Redis, Streamlit
**Repo:** github.com/sinhakushagra21/fitgenai

## What it is
A conversational multi-agent system that generates and maintains personalized diet and workout plans, remembering the user across sessions. It's built as a **deterministic router + specialist tools** pattern on LangGraph.

## Router & orchestration (the cost/control lever)
A fast LLM (GPT-4.1-mini) routes every message before any expensive call. The router does two jobs:
1. **Active-turn gate:** decides whether a message should `stay` (continue the current workflow), `switch` (start a new one), `side_diet`/`side_workout` (answer out-of-band without breaking the workflow), or `direct` (pass through). This is what keeps a half-finished plan from being derailed by a tangential question.
2. **Intent classification:** routes to the diet or workout domain tool with a specific intent (`create_diet`, `update_diet`, `get_diet`, `confirm_diet`, etc.).
Routing on a cheap model first yields ~90% cost savings vs. always calling the big model.

## Specialist tools (state machines)
Each domain tool is a **multi-turn state machine** with 10+ intent handlers, progressing:
`idle → profile_intake_started → profile_complete → plan_generated → plan_confirmed → plan_synced`.
Each handler hydrates domain context from `AgentState` + MongoDB, acts (ask, generate, update), and returns a `ToolMessage` with JSON state updates.

## State management (3-layer)
A `StateManager` runs: **hydrate** AgentState from MongoDB sessions/profiles → **execute** tool → **deep-merge** the tool's JSON updates into AgentState (`state_sync.py`) → **persist** back to MongoDB. Invariant: exactly one active plan per domain; creating a new plan auto-archives the previous one and swaps the RAG chunks.

## Personal RAG (built from the user's own confirmed plans)
- **Chunking:** plans are split by semantic section (H3 headings) into day-tagged chunks (e.g., "Monday — Push Day") with metadata (plan_id, user_id, domain, day_of_week).
- **Embedding/store:** `text-embedding-3-small` (1536-dim) into MongoDB `plan_chunks_vec` with a cosine-similarity vector index.
- **Retrieval:** "What's my Thursday workout?" → embed query → cosine search filtered by user_id/domain/day_of_week → top-k chunks; **falls back to the full plan Markdown** if RAG returns empty.
- **Plan resolver ("my old vegan plan"):** fuzzy LLM matching over active + archived plans by name/profile snapshot, with restore (auto-archives current, reactivates the right chunks).

## Plan generation + evaluation/refinement loop
GPT-5.1 generates a plan (with a macros table / per-day exercise tables) → a `plan_evaluator` scores **completeness, safety, personalization** → if below threshold, a **refinement loop runs up to 3 iterations** → stored as a draft. This is the "self-improving agent output" mechanism.

## Guardrails, integrations, extras
- **Scope guardrails** (`safety/guardrails.py`): restricts to fitness/nutrition; politely declines off-topic ("write a Python script").
- **Google Calendar** OAuth sync for confirmed plans; **YouTube** tutorial enrichment cached in Redis (30-day TTL).
- **Six selectable prompting techniques** (zero-shot, few-shot, CoT, analogical, generate-knowledge, decomposition) for experimentation.
- **Fine-tuning pipeline:** mine confirmed plans → JSONL → OpenAI fine-tune → compare base vs tuned → deploy via env var.

## Testing
**220+ tests across 19 files**, all using `mongomock` (no live DB): router/active-turn, state-sync merges, persistence CRUD, refinement-loop logic, chunker, retriever, embedding storage, OAuth, end-to-end conversation flows.

## Why it's strong
Real agentic-systems engineering: deterministic routing for cost+control, multi-turn state machines, persistent memory, personal RAG with consistency invariants, and an eval-and-refine loop — plus a genuinely tested codebase. Maps directly to "AI agents that optimize/suggest" product work.

---

# Fast Commerce — Grocery-Delivery Database Platform
**Stack:** Oracle, PL/SQL
**Repo:** github.com/sinhakushagra21/fast-commerce-sql-dmdd

## What it is
A full relational database implementation (DDL, DML, views, PL/SQL business logic) for a grocery-delivery service, modeling the end-to-end commerce + fulfillment flow.

## Schema & entities (normalized)
Customers (contact, addresses), Products (inventory, stock levels), Orders (details, quantities), Payments (transactions), Warehouses (fulfillment locations + stock), Delivery zones (postal codes / service areas), and Time slots (scheduling). Relationships support placing an order from the **nearest warehouse**.

## PL/SQL business logic
- **Order placement:** cart management + warehouse selection.
- **Delivery slot validation:** valid slot by location + availability.
- **Stock availability checking:** thresholds prevent out-of-stock sales.
- **Contact-info validation;** positive-quantity enforcement; postal-code/zone restriction.

## Views
Customer order history, per-user order summary, and role-specific product catalog views.

## Role-based access control (3 roles)
- **Admin_role:** full access to all tables/views.
- **User_role:** purchasing only (order/payment, product viewing).
- **Warehouse_manager_role:** stock management, **no access to sensitive user data.**

## Setup sequence
user creation → DDL tables → role grants → DML population → views → business-logic scripts.

## Why it's strong
Genuine database-design depth: normalization/ER modeling, transactional business logic in PL/SQL, reporting views, and a real least-privilege RBAC model — the strongest "Database" specialization evidence.

---

# Resume Tailor — AI Resume-Tailoring Platform
**Stack:** Python, FastAPI, Next.js (React), LiteLLM, TinyDB, Playwright, Chrome extension
**Repo:** github.com/sinhakushagra21/resume-tailor

## What it is
A full-stack platform that tailors a master résumé to a specific job description, scores it the way real hiring screens would, and exports a clean PDF — plus a Chrome extension that auto-fills application forms.

## Tailoring engine (two strong-model calls)
- **Call 1 (Tailor):** one frontier-model pass that holds all three hiring screens at once — **ATS** (keyword/searchability), **recruiter** (6-second scan), **hiring manager** (credibility/depth) — and emits a patch set: bullet rewrites, summary/headline change, skills to add, wording-to-mirror, honest gaps, and the JD keyword universe. Truthfulness is an absolute constraint (no fabrication, no synonym-tech, no property upgrades).
- **Call 2 (Eval):** a fresh-eyes pass that scores the rewritten résumé on the same three screens independently (no self-grading bias).

## Deterministic safety + accounting layer
- **Guards:** preserve personal info, IDs, dates, section structure; strip em-dashes; flag unsupported claims — content safety only.
- **Semantic keyword match:** match % credits synonyms the candidate genuinely has (LLM "missing_supported") so it isn't fooled by literal string mismatch ("LLM" vs "large language models").
- **Honest-gap panel:** surfaces JD must-haves the résumé genuinely lacks (knockout criteria, missing named tech) rather than papering over them.

## Builder, PDF, extension
- **Builder** with live formatting controls (margins, spacing, font/name scale, templates) and a **Fit-to-1-page** preset; settings flow into the PDF.
- **PDF** rendered by headless Chromium (Playwright) from a print page, parameterized by the same settings.
- **Upload fidelity:** recovers hyperlinks and bold spans from uploaded PDFs (pdfminer) so they survive round-trip.
- **Chrome extension:** LLM-backed auto-fill for open-ended application questions, grounded in the selected résumé.

## Why it's strong
Full-stack scope (FastAPI + Next.js + extension), an LLM pipeline with a deterministic truthfulness/accounting layer, and real product surfaces (builder, PDF, browser extension). *Portfolio piece — keep it off the FAANG résumé bullet list itself.*

---

## Cross-cutting interview notes
- For each product, be able to whiteboard the **data flow** and name the **single hardest trade-off** (RolloutX: dual-write → transactional outbox; FitGen: cost/control → cheap-model router + active-turn gate; Fast Commerce: integrity → constraints + RBAC; Resume Tailor: truthfulness → deterministic guards over the LLM).
- Your recurring engineering signature shows up in all four: **correctness under failure, determinism, and clean separation of concerns.**
