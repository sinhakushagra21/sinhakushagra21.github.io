# Project Deep-Dives — Interview Prep

> How to use this: the **narrative** sections expand what you've described into the full story, in plain engineering language you can speak out loud. The **Be ready to answer** sections are the specifics only you know — fill them in truthfully. An interviewer will probe exactly those. Anything marked _(confirm)_ is my inference from your stack; verify it's actually how you built it before you say it.

---

# TESLA — Software Engineer Intern (Aug–Dec 2025)

## 1. Natural Language to Elasticsearch DSL Agent
*(Python, FastAPI, Elasticsearch, LangGraph)*

**The problem.** Internal users needed dashboard widgets backed by Elasticsearch, but writing Elasticsearch DSL (its JSON query language) by hand is error-prone, so non-experts filed cross-team support tickets and some queries silently returned wrong/empty results without anyone noticing.

**What you built.** An LLM agent that takes a plain-English request ("show me failures by region last week") and produces a *validated* Elasticsearch DSL query, with a human-in-the-loop confirmation step before anything runs.

**How it works.** The agent is orchestrated with LangGraph (a state machine over LLM steps). Rather than letting the model free-write raw DSL (unsafe, hallucination-prone), it fills **deterministic query templates** — the model picks intent + parameters, and the system slots them into known-good DSL skeletons. A validation step checks the query is well-formed before it's shown to the user, who confirms before execution. _(confirm: the exact template set and what "validated" checks — schema/field existence? query parse?)_

**Why these choices.** Deterministic templates + validation are the key insight: they make an LLM feature *safe and defensible* — the model can't emit a malformed or destructive query, and the human confirmation prevents acting on a wrong interpretation. That's the difference between a demo and production.

**Impact.** Cut dashboard-widget creation effort by **90%** and eliminated the silent query failures that drove cross-team support tickets.

**Be ready to answer:**
- What did a "deterministic query template" actually look like? Give one concrete example.
- How did you validate the generated DSL before showing it?
- What did the LangGraph state graph contain (nodes/edges)? Why a graph vs a single prompt?
- What was the "silent failure" mode, and how did your design stop it?
- Where's the 90% from — measured against what baseline, over what period?

## 2. LLM Dataset Onboarding Service
*(Python, FastAPI, openpyxl, Pydantic)*

**The problem.** Onboarding a new dataset meant a human reading a raw Excel spec and hand-writing a JSON schema — several days of manual, error-prone work.

**What you built.** A service that ingests the raw Excel spec, uses an LLM to draft the JSON schema, validates it with Pydantic, and processes multiple files concurrently.

**How it works.** openpyxl parses the Excel; the LLM proposes a schema from the spec; **Pydantic validation** is the guardrail that rejects malformed/inc* LLM output before it's accepted; concurrency (async/threads — _confirm which_) processes many files in parallel.

**Why these choices.** Pydantic-as-gate is the same safety pattern as project #1 — the LLM proposes, deterministic validation disposes. Concurrency is what turns "days" into "under an hour."

**Impact.** Cut dataset onboarding from **several days to under an hour**.

**Be ready to answer:**
- What did Pydantic validation catch that raw LLM output got wrong?
- How did you handle concurrency — asyncio, threads, a process pool? Why?
- What happened when the LLM produced a schema Pydantic rejected — retry, human review?
- How many files / what size, to justify "under an hour"?

## 3. Conversational Search Agent
*(Python, FastAPI, Elasticsearch, LangGraph, Redis)*

**The problem.** Users had to know where data lived (assets vs cases vs tickets) and run separate searches; follow-up questions lost context.

**What you built.** A multi-turn conversational agent that answers plain-English questions with precise retrievals across multiple internal datasets, remembering context across turns.

**How it works.** LangGraph orchestrates the turn; **Redis stores session memory** so a follow-up ("what about the open ones?") resolves against the prior turn; retrieval runs against Elasticsearch across the dataset types. _(confirm: how you routed a question to the right dataset, and what "retrieval accuracy" measured.)_

**Why these choices.** Redis session memory is what makes it *conversational* rather than stateless Q&A — that's the whole point and a likely deep-dive.

**Impact.** Improved retrieval accuracy by **80%**.

**Be ready to answer:**
- What exactly is stored in Redis per session, and how is it used on the next turn?
- 80% accuracy measured how — against what test set / baseline / metric (precision? recall?)
- How did you decide which dataset (assets/cases/tickets) a question targeted?
- How is this different from #1 (DSL agent)? (They'll ask why two agents.)

## 4. Email Reply Suggestion API
*(Python, FastAPI, ClickHouse, RAG, Vector Embeddings)*

**The problem.** Internal users (any internal user, not just support agents) wrote similar replies from scratch repeatedly, with no reuse of prior good answers or case context.

**What you built.** A RAG API that drafts a reply grounded in case history, user details, and prior FAQs, so the user starts from a context-aware draft.

**How it works.** Source text (case history, FAQs) is embedded and stored as vectors in **ClickHouse used as a vector store**; at request time the API embeds the query, retrieves the most relevant context, and the LLM drafts a reply grounded in *that* retrieved context (RAG) rather than free-generating. _(confirm: embedding model, why ClickHouse for vectors vs a dedicated vector DB — that's a sharp interview question.)_

**Why these choices.** Grounding in retrieved real context is what keeps the draft accurate and reduces hallucination; "ClickHouse as vector store" is unusual enough that an interviewer will ask why (cost? it was already in the stack? scale?).

**Impact.** _(no metric yet — add a real one: replies drafted/day, adoption %, or minutes saved per reply.)_

**Be ready to answer:**
- Why ClickHouse for vectors instead of pgvector/Pinecone/FAISS? (Have a real reason.)
- What embedding model, what chunking, what similarity metric?
- How did you stop it drafting confidently from irrelevant retrieved context?
- What's the impact number?

## 5. Conversational Ticket Creation Agent
*(Python, FastAPI, LangGraph, Microsoft Teams)*

**The problem.** Creating support tickets through chat risks two failure modes: creating *duplicate* tickets, and the bot *claiming* a ticket was created when it wasn't (hallucinated confirmation).

**What you built.** An **idempotent** agent that creates tickets through natural conversation in Nova and Microsoft Teams, and confirms success to the user *only after* the creation API returns a real ticket ID.

**How it works.** Idempotency means a retried/duplicated request doesn't create a second ticket _(confirm: idempotency key? dedupe on a conversation/request id?)_; the confirmation gate ties the user-facing "done" message to a real API response with a real ticket ID, so the bot can't hallucinate success.

**Why these choices.** This is your **best "production-grade engineering judgment" story** — it shows you thought about correctness under failure (duplicates, false confirmations), which is exactly what HMs probe. Lead with it in AI/agent interviews.

**Impact.** Eliminated duplicate ticket creation and hallucinated confirmations. _(add a number if you have it: duplicate-rate before/after, tickets created.)_

**Be ready to answer:**
- How did you implement idempotency concretely — what was the key, where was it stored?
- What exactly was the race/failure that caused duplicates before?
- Walk through the confirmation gate: what does the agent do between "API called" and "told the user"?

## 6. AI-Assisted Code Review
*(Copilot, Claude, Cursor)*

**Honest note:** this is the weakest item — it describes a *workflow*, not something you built. For a FAANG resume I'd **cut it** unless you can attach a concrete engineering outcome (a bug class you systematically caught, a review-time reduction, a checklist/tool you created). If you keep it, frame the *judgment* (you owned final decisions), not the tooling.

---

# QUALCOMM — Software Engineer (Feb 2023–Aug 2024)

## 1. Multithreaded XML ETL Pipeline
*(Python, NumPy, MongoDB, Elasticsearch, Multithreading)*

**The problem.** The graphics-driver team produced hundreds of huge (8–9 GB) GPU capture files in XML; parsing them serially took weeks, and there was no fast way to query the captured data.

**What you built.** A multithreaded pipeline that parses these large XML captures and loads them into MongoDB and Elasticsearch, making the data queryable.

**How it works.** Parsing is parallelized across threads to use multiple cores _(confirm: how you split work — per-file? streaming chunks within a file? how you handled Python's GIL — was the heavy lifting in NumPy/C extensions that release it?)_; parsed records land in MongoDB (documents) and Elasticsearch (search). The 8–9 GB-per-file scale is the headline — streaming/chunked parsing matters at that size (you can't load it all in memory).

**Why these choices.** This is your strongest **scale + systems** story (large files, multithreading, weeks→days). The GIL question is the likely trap — be ready.

**Impact.** Cut processing from **weeks to 4 days**.

**Be ready to answer:**
- How did you parallelize in Python given the GIL? (Threads only help if work is I/O-bound or in C extensions — which was it?)
- How did you parse 8–9 GB without running out of memory? (Streaming/SAX vs DOM?)
- Why both MongoDB *and* Elasticsearch — what did each serve?
- Weeks→4 days: what was the bottleneck before, and what specifically removed it?

## 2. Priority-Aware Build Scheduler
*(Python, RabbitMQ, Jenkins)*

**The problem.** CI/CD builds ran first-in-first-out, so an urgent release sat behind queued jobs, and the only fix was an engineer **manually** pausing and rescheduling the queue.

**What you built.** A RabbitMQ-based priority scheduler that **automatically** promotes urgent releases (flagged by leads/graphics developers) ahead of queued jobs, removing the manual intervention.

**How it works.** Jobs flow through RabbitMQ with priority levels _(confirm: RabbitMQ priority queues, or separate queues per priority?)_; lead-flagged urgent releases jump the queue automatically; Jenkins executes. The key shift: *priority by policy*, not a human babysitting the queue.

**Why these choices.** Shows you replaced a manual operational pain with an automated system — good "ownership + reliability" story.

**Impact.** Removed the manual pause-and-reschedule work. _(add a metric: urgent-release wait-time reduction, or builds handled/day.)_

**Be ready to answer:**
- RabbitMQ priority queues vs multiple queues — which, and why?
- Who/what set the priority, and how did you prevent everything being marked "urgent"?
- What happened to an in-flight low-priority build when an urgent one arrived — preempt or let finish?

## 3. Automated HLK Server Provisioning
*(Python, Windows, HLK, DirectX)*

**The problem.** After every OS update, setting up HLK (Hardware Lab Kit) controllers and VMs was manual: installs, capture-image copies, folder permissions — slow and error-prone.

**What you built.** A Python script that automates the full post-OS-update setup.

**How it works.** The script orchestrates software installs, copies capture images, and sets folder permissions on Windows HLK controllers and VMs. _(confirm: how you handled failures mid-setup — idempotent re-runs? logging?)_

**Why these choices.** Classic automation win — turns a manual checklist into a repeatable script.

**Impact.** Reduced manual provisioning effort by **70%**.

**Be ready to answer:**
- Was the script idempotent / safe to re-run if it failed halfway?
- How did you handle permissions and machine-specific differences across VMs?

---

# ZOMATO — Software Engineer (Feb 2022–Dec 2022)

## 1. Zomato Gold Payment Backend  *(your strongest backend story)*
*(Go, DynamoDB, gRPC, Protobuf)*

**The problem.** Payment integration for Zomato Gold had to stay correct and available under high load — a double-charge, a lost write, or a cascade when a payment provider slowed down are all unacceptable.

**What you built.** End-to-end payment integration you owned, engineered for reliability under production load.

**How it works (the reliability primitives — know these cold):**
- **Idempotent writes:** a retried payment request doesn't charge twice — the operation keys on a unique id so re-processing is a no-op. _(confirm: what was the idempotency key, where stored — DynamoDB conditional write?)_
- **Retry logic:** transient failures (network blips, provider 5xx) are retried _(confirm: backoff strategy, max attempts.)_
- **Circuit breakers:** when a downstream payment provider is failing, the breaker trips and fails fast instead of piling on requests and cascading. _(confirm: what tripped it, what the open state did.)_

**Why these choices.** Idempotency + retries + circuit breakers are *the* vocabulary of reliable distributed/payment systems — this bullet is gold for FAANG backend interviews. Be able to whiteboard each.

**Impact.** Kept **100,000+ daily transactions** reliable under production load.

**Be ready to answer:**
- Implement idempotency on DynamoDB — conditional writes? a dedupe table? Walk through a double-submit.
- Retry: fixed vs exponential backoff? How did you avoid retry storms?
- Circuit breaker: thresholds to open, behavior while open, how it half-opens/recovers?
- Why DynamoDB for payments? How did you handle consistency (eventual vs strong reads)?
- gRPC/Protobuf: what were the service boundaries?

## 2. Inventory Alerting Service
*(Go, Kafka, Redis, MySQL)*

**The problem.** Cloud kitchens ran out of dish ingredients (stockouts) because no one was watching demand vs stock in time.

**What you built.** A concurrent Go service that consumes daily Kafka demand forecasts and alerts kitchen admins when a dish drops below its restock threshold.

**How it works.** The service consumes Kafka messages (daily forecasts), checks against thresholds, and fires alerts; Redis and MySQL back it _(confirm: Redis for current-stock cache? MySQL for thresholds/state? how concurrency was structured — goroutines per partition?)_.

**Why these choices.** Good event-driven + Go concurrency story.

**Impact.** Reduced stockouts across cloud kitchens. _(add a % if known.)_

**Be ready to answer:**
- What did Redis vs MySQL each hold?
- How did you consume Kafka concurrently in Go — goroutines, consumer groups, partition handling?
- What did "below threshold" actually compute, and how often?

## 3. Zomato Instant Operational APIs
*(Go, MySQL, gRPC, JWT, RBAC)*

**The problem.** The sales team needed engineers to run SQL by hand to onboard kitchens, manage dishes, and change pricing — slow and a bottleneck on engineering.

**What you built.** A self-serve API suite with role-based access control so sales could do these operations themselves, safely.

**How it works.** gRPC APIs gated by JWT auth + **RBAC** (roles decide who can do what); MySQL backs the data. The RBAC is the safety story — self-serve without giving everyone write access to pricing.

**Why these choices.** Removes an engineering bottleneck while keeping control via RBAC — good "impact + security-awareness" story.

**Impact.** Eliminated engineer-run SQL workflows for the sales team. _(add # kitchens onboarded or eng-hours saved.)_

**Be ready to answer:**
- How was RBAC modeled — roles, permissions, enforcement point?
- Where did JWT validation happen, and what was in the token?
- What guardrails stopped a bad self-serve pricing change?

---

# BLUESTONE — Software Engineer (Feb 2021–Dec 2021)

## 1. Catalog & Pricing Pipelines  *(your only professional Java)*
*(Java, PostgreSQL)*

**The problem.** Price/catalog updates across 10K+ SKUs could partially fail, leaving the catalog in an inconsistent state (some SKUs updated, some not), with failures noticed too late.

**What you built.** Idempotent batch pipelines with transactional rollback, plus early failure detection via monitoring dashboards.

**How it works.** **Transactional rollback** means a batch either fully applies or rolls back — no partial price updates _(confirm: per-batch transaction boundary? how big a batch?)_; **idempotency** means re-running a failed batch is safe; monitoring dashboards surfaced failures early _(confirm: what you monitored, where the dashboard lived.)_

**Why these choices.** Correctness-under-partial-failure (atomicity) is a real engineering signal; and this is your **Java** credential — several JDs require Java and this is the one bullet that proves it, so keep it sharp.

**Impact.** Eliminated partial price updates across **10,000+ SKUs**.

**Be ready to answer:**
- Where was the transaction boundary — one big transaction, or per-batch? Trade-offs?
- How did you make re-runs idempotent on Postgres?
- What did the monitoring actually watch, and how did it alert?
- (Resume note: one bullet is thin for a year — if you did schema design, query tuning, or anything else here, add a second bullet.)

---

## Cross-cutting interview prep
- For each project, be able to draw the **data flow on a whiteboard** in 60 seconds.
- For each, have the **one hard trade-off** ready (why X over Y).
- Your three recurring strengths — **reliability primitives** (idempotency, retries, circuit breakers), **safe LLM design** (deterministic templates + validation + human confirmation), and **scale/throughput** (8–9 GB files, 100K txns) — are your narrative. Tie answers back to them.
