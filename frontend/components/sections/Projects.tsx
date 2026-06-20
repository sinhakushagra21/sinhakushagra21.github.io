"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import PaperCard from "@/components/sketch/PaperCard";
import DoodleArrow from "@/components/sketch/DoodleArrow";
import ScribbleUnderline from "@/components/sketch/ScribbleUnderline";
import MarginDoodles from "@/components/sketch/MarginDoodles";
import ArchDiagram from "@/components/sketch/ArchDiagram";

const EASE = [0.22, 1, 0.36, 1] as const;

function GithubIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

const PROJECTS = [
  {
    name: "RolloutX",
    tagline: "Distributed feature-flag platform",
    period: "May 2026 – Jun 2026",
    description:
      "Separate control and data planes: a transactional outbox publishes immutable, versioned snapshots to Kafka, and stateless data-plane replicas evaluate flags in-process over lock-free snapshots.",
    tech: ["Go", "gRPC", "PostgreSQL", "Kafka", "Redis", "Prometheus", "OpenTelemetry", "Kubernetes", "Terraform"],
    highlights: [
      "211 ns per evaluation (~4.7M evals/sec per core) over lock-free in-process snapshots",
      "Deterministic sticky % rollouts via MurmurHash3 — held within ±1% across 1,000,000 keys",
      "Sub-second kill switches + last-known-good SDK fallback so flags keep evaluating during outages",
    ],
    askPrompt: "How does RolloutX evaluate flags so fast?",
    repo: "github.com/sinhakushagra21/RolloutX",
    arch: ["Postgres + outbox", "Kafka snapshots", "Redis invalidate", "data plane (lock-free)", "SDK"],
    rotate: -1.2,
  },
  {
    name: "Fitness Planner",
    tagline: "Stateful multi-agent AI coach",
    period: "Jan 2026 – Apr 2026",
    description:
      "An LLM router sends each turn to specialist diet and workout tools, with vector-search RAG over saved plans and a plan evaluator + refinement loop, all under scope guardrails. Backed by 220+ tests.",
    tech: ["Python", "LangGraph", "OpenAI API", "MongoDB Atlas", "Redis", "RAG", "LangSmith"],
    highlights: [
      "LLM router dispatches each turn to specialist diet & workout agents",
      "Vector-search RAG over saved plans for grounded, personalized recommendations",
      "Plan evaluator with a refinement loop + scope guardrails, backed by 220+ tests",
    ],
    askPrompt: "Walk me through the fitness planner",
    repo: "github.com/sinhakushagra21/fitgenai",
    arch: ["message", "LLM router", "diet / workout tool", "RAG over plans", "evaluator + refine loop"],
    rotate: 1.2,
  },
  {
    name: "Fast Commerce",
    tagline: "Relational DB for grocery delivery",
    period: "Sep 2024 – Dec 2024",
    description:
      "A normalized relational schema covering customers, orders, inventory, delivery operations, and payment workflows for a fast grocery-delivery platform.",
    tech: ["Oracle", "PL/SQL", "SQL"],
    highlights: [
      "Stored procedures, reporting views & delivery-slot validation logic in PL/SQL",
      "Role-based access controls across the schema",
    ],
    askPrompt: "Tell me about the Fast Commerce DB project",
    repo: "github.com/sinhakushagra21/fast-commerce-sql-dmdd",
    arch: ["orders + inventory", "PL/SQL logic", "slot + stock checks", "views + RBAC"],
    rotate: -0.8,
  },
  {
    name: "Resume Tailor",
    tagline: "AI résumé-tailoring platform",
    period: "2026",
    description:
      "Tailors a master résumé to a job description through an LLM pipeline that holds three hiring lenses at once — ATS, recruiter, and hiring-manager — with honest-gap disclosure, a clean PDF export, and a Chrome extension that auto-fills application forms.",
    tech: ["Python", "FastAPI", "Next.js", "LiteLLM", "Playwright", "Chrome Extension"],
    highlights: [
      "Two-pass LLM: a tailoring pass plus an independent fresh-eyes eval that scores against ATS / recruiter / hiring-manager screens",
      "Deterministic guards enforce truthfulness — no fabricated tech, preserves dates & IDs",
      "Semantic keyword match + honest-gap panel; PDF export and a form-autofill Chrome extension",
    ],
    askPrompt: "Tell me about Resume Tailor",
    repo: "github.com/sinhakushagra21/resume-tailor",
    arch: ["résumé + JD", "Tailor (ATS / recruiter / HM)", "Eval (fresh eyes)", "guards + keyword match", "PDF + Chrome ext"],
    rotate: 1.0,
  },
];

function ProjectCard({ project, index }: { project: (typeof PROJECTS)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [showArch, setShowArch] = useState(false);

  function scrollToChat(prompt: string) {
    document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("inject-chat-prompt", { detail: prompt }));
    }, 600);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotate: project.rotate * 3 }}
      animate={inView ? { opacity: 1, y: 0, rotate: project.rotate } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: EASE }}
    >
      <PaperCard seed={400 + index} draw lined className="h-full">
        <div className="p-6 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="display text-4xl leading-none" style={{ color: "var(--red)" }}>
                {project.name}
              </h3>
              <span className="text-xs" style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
                {project.period}
              </span>
            </div>
            <p className="hand text-base" style={{ color: "var(--ink-faint)" }}>
              {project.tagline}
            </p>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {project.description}
          </p>

          <ul className="space-y-2">
            {project.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                <span className="hand shrink-0" style={{ color: "var(--navy)", fontWeight: 700 }}>★</span>
                {h}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="hand text-sm px-2.5 py-0.5"
                style={{
                  background: "var(--paper-card-2)",
                  border: "1.5px solid var(--pencil)",
                  borderRadius: 4,
                  color: "var(--ink-soft)",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* hand-drawn architecture, revealed on demand */}
          <div>
            <button
              onClick={() => setShowArch((v) => !v)}
              className="hand inline-flex items-center gap-1.5 text-sm"
              style={{ color: "var(--ink-faint)", fontWeight: 700 }}
            >
              ✎ {showArch ? "hide architecture" : "see the architecture"}
            </button>
            <AnimatePresence initial={false}>
              {showArch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="pt-3">
                    <ArchDiagram steps={project.arch} seed={(400 + index) * 17 + 5} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href={`https://${project.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hand self-start inline-flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: "var(--ink-soft)", fontWeight: 700 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-soft)")}
            >
              <GithubIcon size={15} /> {project.repo} ↗
            </a>
            <button
              onClick={() => scrollToChat(project.askPrompt)}
              className="hand self-start inline-flex items-center gap-1.5 text-sm"
              style={{ color: "var(--navy)", fontWeight: 700 }}
            >
              <DoodleArrow direction="right" size={26} color="var(--navy)" draw={false} />
              Ask: &ldquo;{project.askPrompt}&rdquo;
            </button>
          </div>
        </div>
      </PaperCard>
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="projects" className="relative overflow-hidden py-28 px-4">
      <MarginDoodles set="projects" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16"
        >
          <span className="scrawl-label">02 / things I&apos;ve made</span>
          <h2 className="relative inline-block mt-2 text-6xl md:text-7xl" style={{ color: "var(--ink)" }}>
            Projects
            <ScribbleUnderline seed={202} color="var(--navy)" />
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.name} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
