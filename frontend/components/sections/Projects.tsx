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
      "A self-hostable feature-flag platform in the LaunchDarkly / Statsig class, built for huge flag counts and heavy read traffic. I split authoring (control plane) from evaluation (a stateless data plane) so flags are checked in-process through an SDK — no network round-trip per check.",
    tech: ["Go", "gRPC", "PostgreSQL", "Kafka", "Redis", "Prometheus", "OpenTelemetry", "Kubernetes", "Terraform"],
    highlights: [
      "A flag check takes about 211 nanoseconds over a lock-free in-memory snapshot — roughly 4.7M evaluations a second, per core.",
      "A transactional outbox ships versioned snapshots to Kafka, so a config change can't half-apply — no “database says one thing, cache says another” bugs.",
      "Percentage rollouts are deterministic and sticky (MurmurHash3) — property-tested to hold within ±1% across a million keys.",
      "Sub-second kill switch, plus a last-known-good fallback so the SDK keeps serving flags even if the control plane or Kafka goes down.",
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
      "A multi-agent fitness coach that remembers you across sessions. A cheap, fast model routes every message to the right specialist tool before any expensive call — which cut model costs roughly 90% versus always reaching for the big model.",
    tech: ["Python", "LangGraph", "OpenAI API", "MongoDB Atlas", "Redis", "RAG", "LangSmith"],
    highlights: [
      "Each domain is a multi-turn state machine that walks you from profile → plan → confirmed, with a personal RAG over your own saved plans.",
      "A plan evaluator scores every draft for completeness, safety, and personalization, then runs a refinement loop until it passes.",
      "220+ tests (all mocked, no live DB), plus guardrails that politely turn down anything off-topic.",
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
      "A full relational database for a grocery-delivery service — the schema, the business logic, and the access control, end to end in Oracle and PL/SQL.",
    tech: ["Oracle", "PL/SQL", "SQL"],
    highlights: [
      "Normalized schema across customers, orders, inventory, warehouses, and delivery zones — orders are fulfilled from the nearest warehouse.",
      "PL/SQL handles order placement, delivery-slot validation, and stock checks, with reporting views layered on top.",
      "Three least-privilege roles, so warehouse staff manage stock but never touch sensitive customer data.",
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
      "A full-stack tool that tailors my master résumé to a specific job, scores it the way real hiring screens would, and exports a clean PDF — plus a Chrome extension that auto-fills application forms.",
    tech: ["Python", "FastAPI", "Next.js", "LiteLLM", "Playwright", "Chrome Extension"],
    highlights: [
      "Two LLM passes: one rewrites against ATS, recruiter, and hiring-manager lenses; a second fresh-eyes pass scores the result independently, so it isn't grading its own work.",
      "A deterministic guard layer keeps it honest — it won't invent tech or inflate claims, and it surfaces real gaps instead of hiding them.",
      "Semantic keyword matching credits skills I genuinely have even when the job post words them differently.",
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
      whileHover={{ rotate: 0, y: -6, scale: 1.015, transition: { duration: 0.25, ease: EASE } }}
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
                className="sketch-chip hand text-sm px-2.5 py-0.5"
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
