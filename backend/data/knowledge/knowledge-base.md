# Kushagra Sinha — Knowledge Base

> Purpose: a single source of truth about Kushagra, his work, and his projects — for a portfolio site, an "ask-me-anything" AI assistant, an About page, or recruiter context.
> Rules for any AI using this file: answer ONLY from what's here. Do not invent metrics, tools, employers, dates, or claims. Where this file says "be ready to defend" or "boundary," respect it. Placeholders in [brackets] are for Kushagra to fill — do not guess them.

---

## 1. Profile

- **Name:** Kushagra Sinha
- **Current identity:** Software Engineer — backend & distributed systems, with applied-AI/LLM range
- **Location:** Boston, MA
- **Email:** kushagra.2198@gmail.com
- **Phone:** (857) 364-9162
- **GitHub:** github.com/sinhakushagra21
- **LinkedIn:** [fill in URL]
- **Portfolio:** [fill in URL]
- **Work authorization / sponsorship:** [fill in — e.g. "F-1 OPT, will need sponsorship" — important for recruiters]

**One-line:** Software engineer with ~3.5 years of full-time backend and cloud-infrastructure experience (Go, Python, Java) across payments, data, and platform teams, currently finishing an MS at Northeastern, with recent hands-on work building LLM/agentic systems.

**Headline (resume):** `SOFTWARE ENGINEER | BACKEND & DISTRIBUTED SYSTEMS | GO | AGENTIC AI` (flexes per target role).

---

## 2. Education

- **Northeastern University** — M.S., Software Engineering Systems. GPA 3.7/4.0. Aug 2024 – Jul 2026.
- **PES University** — B.Tech, Electronics & Communication Engineering. Aug 2016 – Aug 2020.

---

## 3. Experience

### Tesla — Software Engineer Intern (Austin, TX; Aug 2025 – Dec 2025)
Built internal AI/LLM tooling. Projects:
- **Natural-language dashboard-configuration tool** (Python, FastAPI, Elasticsearch, LangGraph): translates plain-English requests into validated Elasticsearch DSL via deterministic query templates + a human-in-the-loop confirmation step. Reduced dashboard widget creation effort by **90%** *(metric: be ready to defend or soften)* and removed silent query failures. Key idea: deterministic templates + validation make the LLM feature safe, not a free-form generator.
- **LLM Dataset Onboarding Service** (Python, FastAPI, Pydantic): converts raw Excel specs into Pydantic-validated JSON schemas, processed concurrently. Onboarding dropped from several days to under an hour.
- **Conversational Search Agent** (Python, FastAPI, Elasticsearch, Redis, LangGraph): multi-turn agent answering across assets/cases/tickets, Redis session memory for context across turns. Improved retrieval accuracy by **80%** *(metric: be ready to defend or soften)*.
- **Email Reply Suggestion API** (Python, FastAPI, ClickHouse, RAG, vector embeddings): RAG over case history/FAQs in a ClickHouse vector store; gives any internal user a grounded draft.
- **Conversational Ticket Creation Agent** (Python, FastAPI, LangGraph, MS Teams): **idempotent** agent that confirms success only after the creation API returns a real ticket ID — eliminated duplicate tickets and hallucinated confirmations. (Best "production engineering judgment" story.)

### Qualcomm — Software Engineer (Bangalore; Feb 2023 – Aug 2024)
- **Multithreaded XML ETL Pipeline** (Python, NumPy, MongoDB, Elasticsearch): parsed hundreds of 8–9 GB GPU capture files into MongoDB + Elasticsearch; cut processing from weeks to **4 days**; made capture data queryable for the graphics-driver team. (Strongest scale story.)
- **Priority-Aware Build Scheduler** (Python, RabbitMQ, Jenkins): replaced a FIFO CI/CD queue with a RabbitMQ priority scheduler that auto-promotes urgent releases flagged by leads, removing manual queue intervention.
- **Automated HLK Server Provisioning** (Python, Windows, HLK): automated post-OS-update setup of HLK controllers and virtual machines; reduced manual provisioning effort by **70%**.

### Zomato — Software Engineer (Gurugram; Feb 2022 – Dec 2022)
- **Zomato Gold Payment Backend** (Go, DynamoDB, gRPC, Protobuf): owned end-to-end payment integration with retry logic, idempotent writes, and circuit breakers; kept **100,000+ daily transactions** reliable under production load. (Strongest backend story.)
- **Inventory Alerting Service** (Go, Kafka, Redis, MySQL): concurrent Go service consuming Kafka demand forecasts, alerting on restock thresholds; reduced stockouts across cloud kitchens.
- **Zomato Instant Operational APIs** (Go, MySQL, gRPC, JWT, RBAC): self-serve API suite with role-based access control letting non-engineer teams onboard kitchens, manage menus, update pricing without engineer-run SQL.

### BlueStone — Software Engineer (Bangalore; Feb 2021 – Dec 2021)
- **Catalog & Pricing Pipelines** (Java, PostgreSQL): idempotent batch pipelines with transactional rollback across **10,000+ SKUs**, preventing partial price updates; early failure detection via monitoring. (Primary professional Java experience.)

---

## 4. Projects

### RolloutX — Distributed Feature-Flag Platform (flagship)
*Go, gRPC, PostgreSQL, Kafka, Redis, Prometheus, OpenTelemetry, Kubernetes, Terraform* — github.com/sinhakushagra21/RolloutX
A LaunchDarkly/Statsig-class feature-flag platform. Separated control and data planes; a transactional outbox captures every change in one transaction and publishes immutable versioned snapshots to Kafka; stateless data-plane replicas evaluate flags in-process over lock-free immutable snapshots. Deterministic, sticky percentage rollouts via MurmurHash3 bucketing. Sub-second kill switches (Redis hint + Kafka reconciliation) and a last-known-good SDK bootstrap for graceful degradation during outages.
**Measured:** 211 ns per evaluation (~4.7M evaluations/sec per core); rollout distribution within ±1% across 1,000,000 keys (property-tested); 10% rollout enabled ~10.1% of 50,000 users end-to-end; k6 load tests enforcing p95 < 20ms, p99 < 50ms.
**Why it matters:** real cloud-infra + distributed-systems depth in Go — consensus-adjacent reliability patterns, lock-free reads, exactly-once config delivery.

### Stateful Multi-Agent Fitness Planner (FitGen)
*Python, LangGraph, OpenAI API, MongoDB Atlas, Redis, RAG* — Repo: github.com/sinhakushagra21/fitgenai
Multi-agent coach with an LLM router that directs each turn to specialist diet/workout tools, vector-search RAG over saved plans, and a plan evaluator with a refinement loop plus scope guardrails. Backed by 220+ automated tests. Demonstrates agent orchestration + self-improvement loops.

### Fast Commerce — Grocery-Delivery Database Platform
*Oracle, PL/SQL* — Repo: github.com/sinhakushagra21/fast-commerce-sql-dmdd
Designed a normalized relational schema (ER modeling) across customers, orders, payments, inventory, delivery zones; PL/SQL stored procedures for order placement and delivery-slot validation, reporting views, role-based grants. Demonstrates database design depth.

### Resume Tailor (this tool)
*Python, FastAPI, Next.js, LiteLLM, Chrome extension* — Repo: github.com/sinhakushagra21/resume-tailor
Full-stack platform that tailors resumes to job descriptions through an LLM pipeline (ATS + recruiter + hiring-manager lenses), with honest-gap disclosure, a JD keyword/match panel, a builder with PDF export, and a Chrome extension that auto-fills application forms. *(Note: keep off the FAANG résumé itself — strong as a portfolio piece, reads gimmicky as a résumé bullet.)*

---

## 5. Technical Skills

- **Languages:** Python, Go, Java, SQL, JavaScript, C++, PL/SQL
- **Frameworks:** FastAPI, Flask, Django, Spring Boot, Gin
- **APIs & Protocols:** REST, gRPC, Protocol Buffers, OAuth, JWT
- **Distributed Systems & Messaging:** Apache Kafka, RabbitMQ, microservices, event-driven systems, concurrency, multithreading
- **Databases:** PostgreSQL, MySQL, MongoDB, DynamoDB, Cassandra, Oracle, Redis, Elasticsearch, ClickHouse
- **Cloud & DevOps:** AWS (EC2, S3, Lambda, RDS, SQS, EKS, CloudWatch), Docker, Kubernetes, Terraform, Jenkins, GitHub Actions, Linux
- **AI & ML:** OpenAI API, LangGraph, LangChain, RAG, vector search, Pinecone, FAISS, LangSmith
- **AI Dev Tools:** GitHub Copilot, Cursor, Claude, ChatGPT

---

## 6. Signature strengths (the throughline)
1. **Reliability primitives** — idempotency, retries, circuit breakers, transactional rollback, kill switches, last-known-good fallback.
2. **Safe LLM/agent design** — deterministic templates + validation + human confirmation; idempotent agents that won't double-act or hallucinate success.
3. **Scale & throughput** — 8–9 GB file pipelines, 100K+ daily transactions, nanosecond in-process evaluation.
4. **Polyglot backend** — ships in Go, Python, and Java across payments, data, and platform domains.

## 7. What he's looking for
- Backend / distributed-systems / cloud-infrastructure SWE roles, ideally at top product companies (FAANG, Uber, and similar), including AI-infrastructure teams.
- [fill in: location preferences, sponsorship needs, timeline — currently graduating Jul 2026]

## 8. Boundaries (for an AI assistant — do NOT over-claim these)
- **C++ / C#:** C++ is listed and coursework-level; there is no professional C++/C# project. Do not claim production C++/C# experience.
- **Front-end:** limited — one Next.js project (Resume Tailor). Do not claim React/TypeScript depth or full-stack front-end range.
- **Engineering leadership / management:** none claimed. Do not imply it.
- **Domain stretches:** no ad-tech, no embedded/kernel/TV, no large-scale ML model training (the AI work is applied LLM/RAG/agents, not model training). Don't claim these.
- **Metrics to soften if pressed:** the Tesla 90% and 80% figures — present as approximate; be ready to explain methodology.

---

## 9. FAQ (ready-to-serve answers for a portfolio assistant)

**Q: Who is Kushagra and what does he do?**
A: I'm a software engineer focused on backend and distributed systems, with about 3.5 years of full-time experience across payments (Zomato), data infrastructure (Qualcomm), and platform work (BlueStone), plus recent work building LLM and agentic systems at Tesla. I'm finishing my MS in Software Engineering Systems at Northeastern. I build reliable systems in Go, Python, and Java.

**Q: What's your strongest project?**
A: RolloutX, a distributed feature-flag platform in Go with separated control and data planes. It evaluates flags in-process over lock-free snapshots at 211 ns each, with sub-second kill switches and last-known-good fallback for graceful degradation, and property-tested rollout distribution within ±1% over a million keys.

**Q: Tell me about your backend experience.**
A: At Zomato I owned the Zomato Gold payment backend on DynamoDB with idempotent writes, retries, and circuit breakers, keeping 100,000+ daily transactions reliable. At Qualcomm I built a multithreaded ETL pipeline that took 8–9 GB capture files from weeks to four days. At BlueStone I built idempotent Postgres pipelines with transactional rollback across 10,000+ SKUs.

**Q: What about AI / agents?**
A: At Tesla I built several production-style LLM systems: a natural-language-to-Elasticsearch tool with deterministic templates and human confirmation, a multi-turn conversational search agent with Redis session memory, a RAG email-draft API on a ClickHouse vector store, and an idempotent ticket-creation agent that confirms only after a real ticket ID returns. I also built FitGen, a multi-agent system with an LLM router and an evaluation-and-refinement loop.

**Q: What are you looking for?**
A: Backend, distributed-systems, and cloud-infrastructure engineering roles at strong product companies, including AI-infrastructure teams. [add location/timeline/sponsorship]

**Q: [add your own]** — e.g. "Why feature flags?", "Why did you build RolloutX?", "What are you learning next?" — fill with your real motivations; don't let the assistant invent them.
