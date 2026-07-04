// Content for the WhatsApp-style portfolio. The "ai" chat is the live RAG bot;
// the rest are scripted threads that reveal résumé content as messages.

export interface WAMessage {
  from: "them" | "me";
  text: string;
  /** optional link rendered as a tappable row */
  link?: { label: string; href: string };
}

export interface WAChat {
  id: string;
  name: string;
  avatar: string; // emoji or single letter
  avatarBg: string;
  blurb: string; // preview line in the sidebar
  time: string;
  pinned?: boolean;
  verified?: boolean;
  ai?: boolean; // live RAG chat
  header?: string; // status shown under the name in the chat header
  messages?: WAMessage[];
}

export const CHATS: WAChat[] = [
  {
    id: "ai",
    name: "Kushagra Sinha",
    avatar: "👨🏻‍💻",
    avatarBg: "#0b3d34",
    blurb: "Ask me anything — I answer from my notes 🤖",
    time: "now",
    pinned: true,
    verified: true,
    ai: true,
    header: "online",
  },
  {
    id: "status",
    name: "System Status",
    avatar: "🟢",
    avatarBg: "#0e7a5f",
    blurb: "Live backend health & latency",
    time: "live",
    header: "pinging the API in real time",
  },
  {
    id: "experience",
    name: "Work Experience",
    avatar: "💼",
    avatarBg: "#5b6b7b",
    blurb: "4 years — Tesla, Qualcomm, Zomato, Bluestone",
    time: "Dec 2025",
    header: "Tesla · Qualcomm · Zomato · Bluestone",
    messages: [
      { from: "them", text: "Here's the 4-year rundown 👇" },
      { from: "them", text: "🚗 *Tesla* — Software Engineer Intern (Aug–Dec 2025, Austin)" },
      { from: "them", text: "Built an AI agent that turns plain English into real Elasticsearch dashboards — non-experts stopped filing tickets and setup got ~90% faster. Made it safe by design: the model fills vetted query templates and a human confirms before anything runs." },
      { from: "them", text: "Also shipped a conversational search agent with Redis-backed memory (~80% better retrieval), a RAG email-draft API on a ClickHouse vector store, and an idempotent Teams bot that only confirms a ticket once a real ID comes back — no duplicates." },
      { from: "them", text: "📡 *Qualcomm* — Software Engineer (2023–2024, Bangalore)" },
      { from: "them", text: "Took the graphics team's 8–9 GB GPU capture files from a weeks-long parse down to ~4 days with a multithreaded pipeline into MongoDB + Elasticsearch. Replaced their FIFO build queue with a RabbitMQ priority scheduler so urgent releases jump the line automatically." },
      { from: "them", text: "🍽️ *Zomato* — Software Engineer (2022, Gurugram)" },
      { from: "them", text: "Owned the Zomato Gold payment backend in Go — idempotent writes, retries, and circuit breakers kept 100K+ daily transactions reliable even when a provider got flaky. Plus an event-driven stock-alert service and self-serve onboarding APIs with RBAC." },
      { from: "them", text: "💎 *Bluestone* — Software Engineer (2021, Bangalore)" },
      { from: "them", text: "Built Java/Postgres catalog + pricing pipelines where each batch fully applied or rolled back — no half-updated prices across 10,000+ SKUs, with monitoring that caught failures early." },
      { from: "them", text: "Want the deep dive on any of these? Head to the *Kushagra Sinha* chat and just ask 🙂" },
    ],
  },
  {
    id: "projects",
    name: "Projects",
    avatar: "🚀",
    avatarBg: "#8a63d2",
    blurb: "RolloutX · Fitness Planner · Fast Commerce · Resume Tailor",
    time: "2026",
    header: "4 projects",
    messages: [
      { from: "them", text: "A few things I've built on my own 👇" },
      { from: "them", text: "🚩 *RolloutX* — distributed feature-flag platform (Go)" },
      { from: "them", text: "LaunchDarkly-class, built for heavy read traffic. A flag check takes ~211 nanoseconds over a lock-free in-memory snapshot (≈4.7M/sec per core). A transactional outbox ships versioned snapshots to Kafka so config can't half-apply, with sub-second kill switches + last-known-good fallback." },
      { from: "them", link: { label: "github.com/sinhakushagra21/RolloutX", href: "https://github.com/sinhakushagra21/RolloutX" }, text: "Repo 👇" },
      { from: "them", text: "🏋️ *Fitness Planner* — stateful multi-agent AI coach (Python, LangGraph)" },
      { from: "them", text: "A cheap model routes every message to the right specialist tool before any expensive call (~90% cost savings). Multi-turn state machines, a personal RAG over your saved plans, and a plan evaluator that refines drafts until they pass. 220+ tests." },
      { from: "them", link: { label: "github.com/sinhakushagra21/fitgenai", href: "https://github.com/sinhakushagra21/fitgenai" }, text: "Repo 👇" },
      { from: "them", text: "🛒 *Fast Commerce* — grocery-delivery database (Oracle, PL/SQL)" },
      { from: "them", text: "Full normalized schema + PL/SQL business logic (order placement, delivery-slot validation, stock checks) and three least-privilege roles so warehouse staff never touch customer data." },
      { from: "them", link: { label: "github.com/sinhakushagra21/fast-commerce-sql-dmdd", href: "https://github.com/sinhakushagra21/fast-commerce-sql-dmdd" }, text: "Repo 👇" },
      { from: "them", text: "📄 *Resume Tailor* — AI résumé-tailoring platform (full-stack)" },
      { from: "them", text: "Tailors my résumé to a job across ATS/recruiter/hiring-manager lenses, with a deterministic guard layer that keeps it honest (no invented tech), plus a Chrome extension that auto-fills applications." },
      { from: "them", link: { label: "github.com/sinhakushagra21/resume-tailor", href: "https://github.com/sinhakushagra21/resume-tailor" }, text: "Repo 👇" },
    ],
  },
  {
    id: "skills",
    name: "Skills & Stack",
    avatar: "🛠️",
    avatarBg: "#0088cc",
    blurb: "Go · Python · Java · distributed systems · AI",
    time: "",
    header: "the toolbox",
    messages: [
      { from: "them", text: "My stack, roughly by depth 👇" },
      { from: "them", text: "*Languages* — Python, Go, Java, SQL, JavaScript, C++, PL/SQL" },
      { from: "them", text: "*Backend & distributed* — FastAPI, Flask, Django, Spring Boot, Gin · gRPC, REST, Protobuf · Kafka, RabbitMQ · microservices, event-driven, concurrency" },
      { from: "them", text: "*Databases* — PostgreSQL, MySQL, MongoDB, DynamoDB, Cassandra, Oracle, Redis, Elasticsearch, ClickHouse" },
      { from: "them", text: "*Cloud & DevOps* — AWS, Docker, Kubernetes, Terraform, Jenkins, GitHub Actions, Linux" },
      { from: "them", text: "*AI / LLM* — LangGraph, LangChain, RAG, vector search, Pinecone, FAISS, LangSmith" },
      { from: "them", text: "Honest boundaries: C++ is coursework-level, front-end is limited (one Next.js project), and my AI work is applied LLM/RAG/agents — not model training." },
    ],
  },
  {
    id: "education",
    name: "Education",
    avatar: "🎓",
    avatarBg: "#c0392b",
    blurb: "MS @ Northeastern · B.Tech @ PES",
    time: "2026",
    header: "MS Software Engineering Systems",
    messages: [
      { from: "them", text: "🎓 *Northeastern University* — M.S., Software Engineering Systems (Aug 2024 – Jul 2026), Boston. GPA 3.7." },
      { from: "them", text: "🎓 *PES University* — B.Tech, Electronics & Communication Engineering (2016 – 2020), Bangalore." },
      { from: "them", text: "Graduating mid-2026 → available to start around August 2026, and open to relocation anywhere in the US 🌎" },
    ],
  },
  {
    id: "contact",
    name: "Contact & Links",
    avatar: "📇",
    avatarBg: "#e8a55a",
    blurb: "Email · LinkedIn · GitHub · Resume · Book a call",
    time: "",
    header: "let's talk",
    messages: [
      { from: "them", text: "Best ways to reach me 👇" },
      { from: "them", link: { label: "kushagra.2198@gmail.com", href: "mailto:kushagra.2198@gmail.com" }, text: "📧 Email" },
      { from: "them", link: { label: "linkedin.com/in/kushagra-2198", href: "https://linkedin.com/in/kushagra-2198" }, text: "💼 LinkedIn" },
      { from: "them", link: { label: "github.com/sinhakushagra21", href: "https://github.com/sinhakushagra21" }, text: "🐙 GitHub" },
      { from: "them", link: { label: "Download résumé (PDF)", href: "/resume.pdf" }, text: "📄 Résumé" },
      { from: "them", text: "Open to SWE / SDE / AI Engineer roles from Aug 2026. I'll need H1B sponsorship (F-1 OPT) and I'm happy to relocate." },
    ],
  },
];
