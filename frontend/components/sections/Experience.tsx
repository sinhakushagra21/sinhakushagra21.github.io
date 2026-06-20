"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useInView,
  AnimatePresence,
} from "framer-motion";
import PaperCard from "@/components/sketch/PaperCard";
import DoodleArrow from "@/components/sketch/DoodleArrow";
import ScribbleUnderline from "@/components/sketch/ScribbleUnderline";
import MarginDoodles from "@/components/sketch/MarginDoodles";
import { usePrefersReducedMotion, useIsDesktop } from "@/components/sketch/useSketch";

const EASE = [0.22, 1, 0.36, 1] as const;

const EXPERIENCES = [
  {
    company: "Tesla",
    role: "Software Engineer Intern",
    period: "Aug 2025 – Dec 2025",
    location: "Austin, TX",
    logo: "T",
    color: "#cc0000",
    highlights: [
      "NL → Elasticsearch DSL dashboard platform (FastAPI + LangGraph) with deterministic templates + human-in-the-loop — 90% faster widget creation",
      "Conversational search across assets, cases & tickets (Elasticsearch, Redis, LangGraph) holding session context — 80% retrieval accuracy gain",
      "RAG email-generation API (ClickHouse vector search + embeddings) drafting context-aware emails from historical cases",
      "Dataset onboarding service: Excel specs → validated JSON schemas (FastAPI, Pydantic, concurrency) — days to under an hour",
      "Idempotent ticket agent on Microsoft Teams — backend-confirmed creation, no duplicates or hallucinated confirmations",
    ],
    chips: ["LangGraph", "FastAPI", "Elasticsearch", "ClickHouse", "RAG"],
    askPrompt: "What did you build at Tesla?",
  },
  {
    company: "Qualcomm",
    role: "Software Engineer",
    period: "Feb 2023 – Aug 2024",
    location: "Bangalore, IN",
    logo: "Q",
    color: "#3253a0",
    highlights: [
      "Multithreaded XML ETL pipeline (Python, NumPy, MongoDB, Elasticsearch) over hundreds of 8–9 GB GPU capture files — weeks to ~4 days",
      "Replaced FIFO CI/CD with a RabbitMQ priority scheduler wired into Jenkins — auto-promoted urgent builds, removed manual queue intervention",
    ],
    chips: ["Python", "NumPy", "MongoDB", "RabbitMQ", "Jenkins"],
    askPrompt: "What did you do at Qualcomm?",
  },
  {
    company: "Zomato",
    role: "Software Engineer",
    period: "Feb 2022 – Dec 2022",
    location: "Gurugram, IN",
    logo: "Z",
    color: "#e23744",
    highlights: [
      "Event-driven inventory alerting service (Go, Kafka, Redis, MySQL) consuming demand forecasts — fewer stock-outs across cloud kitchens",
      "Owned Zomato Gold payment integrations (Go, DynamoDB, gRPC, Protobuf) with retries, circuit breakers & idempotent writes — 100K+ daily transactions",
      "Built Zomato Instant Admin APIs with JWT + RBAC — sales teams onboard kitchens, menus & pricing without engineer-run SQL",
    ],
    chips: ["Go", "gRPC", "Kafka", "DynamoDB", "Redis"],
    askPrompt: "How did you scale payments at Zomato?",
  },
  {
    company: "Bluestone",
    role: "Software Engineer",
    period: "Feb 2021 – Dec 2021",
    location: "Bangalore, IN",
    logo: "B",
    color: "#1a6b8a",
    highlights: [
      "Engineered catalog & pricing pipelines (Java, PostgreSQL) with transactional rollback and idempotent batch processing across 10,000+ SKUs",
      "Prevented partial catalog updates and kept data consistent through high-volume pricing batches",
    ],
    chips: ["Java", "PostgreSQL", "SQL"],
    askPrompt: "What did you build at Bluestone?",
  },
];

const CARD_COUNT = EXPERIENCES.length;

function scrollToChat(prompt: string) {
  const chatEl = document.getElementById("home");
  if (chatEl) {
    chatEl.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("inject-chat-prompt", { detail: prompt }));
    }, 600);
  }
}

function CardContent({ exp, seed, flat = false }: { exp: (typeof EXPERIENCES)[0]; seed: number; flat?: boolean }) {
  return (
    <PaperCard seed={seed} lined className={flat ? "" : "h-full"}>
      <div className={flat ? "p-6" : "p-6 md:p-7 h-full overflow-hidden"}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 flex items-center justify-center text-xl shrink-0 display"
              style={{
                background: "var(--paper-card-2)",
                color: "var(--ink)",
                borderRadius: "48% 52% 50% 50% / 52% 48% 52% 48%",
                border: "2px solid var(--ink)",
                fontWeight: 700,
              }}
              aria-hidden
            >
              {exp.logo}
            </div>
            <div>
              <h3 className="display text-2xl leading-none" style={{ color: "var(--ink)" }}>
                {exp.company}
              </h3>
              <p className="hand text-sm" style={{ color: "var(--ink-soft)" }}>
                {exp.role}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-medium" style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
              {exp.period}
            </p>
            <p className="text-xs" style={{ color: "var(--muted-soft)" }}>{exp.location}</p>
          </div>
        </div>

        <ul className="space-y-2 mb-3">
          {exp.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: "var(--ink-soft)" }}>
              <span className="hand shrink-0" style={{ color: "var(--navy)", fontWeight: 700 }}>✓</span>
              {h}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {exp.chips.map((chip) => (
            <span
              key={chip}
              className="hand text-xs px-2 py-0.5"
              style={{
                background: "var(--paper-card-2)",
                border: "1.5px solid var(--pencil)",
                borderRadius: 4,
                color: "var(--ink-soft)",
              }}
            >
              {chip}
            </span>
          ))}
        </div>

        <button
          onClick={() => scrollToChat(exp.askPrompt)}
          className="hand group inline-flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "var(--navy)", fontWeight: 700 }}
        >
          <DoodleArrow direction="right" size={26} color="var(--navy)" draw={false} />
          Ask: &ldquo;{exp.askPrompt}&rdquo;
        </button>
      </div>
    </PaperCard>
  );
}

const TURN_MS = 820;

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headerRef, { once: true, margin: "-80px" });
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [turning, setTurning] = useState(false);
  const [turnKey, setTurnKey] = useState(0);
  const reduced = usePrefersReducedMotion();
  const desktop = useIsDesktop();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const clamped = Math.max(0, Math.min(Math.floor(v * CARD_COUNT), CARD_COUNT - 1));
    if (clamped !== activeIndex) {
      setDirection(clamped > activeIndex ? 1 : -1);
      setPrevIndex(activeIndex);
      setActiveIndex(clamped);
      if (!reduced) {
        setTurnKey((k) => k + 1);
        setTurning(true);
      }
    }
  });

  // end the turn after its duration; resets if another turn starts mid-flight
  useEffect(() => {
    if (!turning) return;
    const t = setTimeout(() => setTurning(false), TURN_MS);
    return () => clearTimeout(t);
  }, [turnKey, turning]);

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const forward = direction >= 0;
  // page revealed underneath; the turning page sits on top
  const basePage = turning ? (forward ? activeIndex : prevIndex) : activeIndex;
  const overlayPage = forward ? prevIndex : activeIndex;

  const header = (
    <motion.div
      ref={headerRef}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE }}
      className="text-center mb-8"
    >
      <div>
        <span className="scrawl-label">01 / where I&apos;ve worked</span>
      </div>
      <h2 className="relative inline-block mt-2 text-5xl sm:text-6xl md:text-7xl" style={{ color: "var(--ink)" }}>
        Experience
        <ScribbleUnderline seed={101} color="var(--navy)" />
      </h2>
      <p className="hand mt-4 text-base max-w-lg mx-auto" style={{ color: "var(--ink-faint)" }}>
        4 years across payments, GPU tooling, AI agents, and catalog systems.
      </p>
    </motion.div>
  );

  // Mobile / tablet: a plain stacked list — the sticky scroll-swap page-turn
  // does not fit small screens (it overlaps the dots/progress).
  if (!desktop) {
    return (
      <section id="experience" ref={sectionRef} className="relative overflow-hidden py-20 px-4">
        <MarginDoodles set="experience" />
        <div className="relative z-10 max-w-2xl mx-auto">
          {header}
          <div className="flex flex-col gap-8 mt-8">
            {EXPERIENCES.map((exp, i) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <CardContent exp={exp} seed={200 + i} flat />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="experience" ref={sectionRef} style={{ position: "relative", height: `${CARD_COUNT * 100 + 50}vh` }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center px-4 overflow-hidden">
        <MarginDoodles set="experience" />
        {header}

        <div
          className="relative max-w-2xl mx-auto w-full"
          style={{ height: "min(66vh, 560px)", perspective: 2400 }}
        >
          {/* the page underneath, revealed as the top page turns */}
          <div className="absolute inset-0">
            <CardContent exp={EXPERIENCES[basePage]} seed={200 + basePage} />
          </div>

          {/* the turning page: front = its content, back = blank ruled paper */}
          <AnimatePresence>
            {turning && (
              <motion.div
                key={turnKey}
                className="absolute inset-0"
                style={{ transformOrigin: "left center", transformStyle: "preserve-3d", zIndex: 10 }}
                initial={{ rotateY: forward ? 0 : -178 }}
                animate={{ rotateY: forward ? -178 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: TURN_MS / 1000, ease: [0.36, 0, 0.22, 1] }}
              >
                <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                  <CardContent exp={EXPERIENCES[overlayPage]} seed={200 + overlayPage} />
                </div>
                {/* blank back of the sheet */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "var(--paper-card)",
                    borderRadius: 6,
                    border: "2px solid var(--ink)",
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, transparent 0, transparent 27px, var(--pencil-soft) 27px, var(--pencil-soft) 28px)",
                  }}
                />
                {/* shadow that sweeps as the page lifts */}
                <motion.div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    borderRadius: 6,
                    pointerEvents: "none",
                    backfaceVisibility: "hidden",
                    background: "linear-gradient(100deg, rgba(0,0,0,0.32), rgba(0,0,0,0) 55%)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0.1] }}
                  transition={{ duration: TURN_MS / 1000 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-3 mt-6">
          <div className="flex gap-2">
            {EXPERIENCES.map((exp, i) => (
              <div
                key={exp.company}
                className="transition-all duration-300"
                style={{
                  width: i === activeIndex ? 22 : 9,
                  height: 9,
                  borderRadius: 5,
                  border: "1.5px solid var(--ink)",
                  background: i === activeIndex ? "var(--red)" : "transparent",
                }}
              />
            ))}
          </div>
          <div className="w-48 h-[3px] relative" style={{ background: "var(--pencil-soft)", borderRadius: 2 }}>
            <motion.div className="h-full absolute top-0 left-0" style={{ width: progressWidth, background: "var(--red)", borderRadius: 2 }} />
          </div>
          <p className="hand text-sm" style={{ color: "var(--muted-soft)" }}>
            keep scrolling · {activeIndex + 1}/{CARD_COUNT}
          </p>
        </div>
      </div>
    </section>
  );
}
