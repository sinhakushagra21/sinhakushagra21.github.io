"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import PaperCard from "@/components/sketch/PaperCard";
import ScribbleUnderline from "@/components/sketch/ScribbleUnderline";
import MarginDoodles from "@/components/sketch/MarginDoodles";

const EASE = [0.22, 1, 0.36, 1] as const;

const EDUCATION = [
  {
    school: "Northeastern University",
    degree: "M.S., Software Engineering Systems",
    period: "Aug 2024 – Jul 2026",
    location: "Boston, MA",
    gpa: "3.7 / 4.0",
    coursework: ["Algorithms & Data Structures", "Distributed Systems", "Prompt Engineering & Multi-Agent AI"],
    rotate: -1,
  },
  {
    school: "PES University",
    degree: "B.Tech, Electronics & Communication Engineering",
    period: "Aug 2016 – Aug 2020",
    location: "Bangalore, India",
    gpa: "",
    coursework: ["Circuit Design", "Signal Processing", "Embedded Systems"],
    rotate: 1,
  },
];

function EduCard({ edu, index }: { edu: (typeof EDUCATION)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div className="relative pl-10">
      {/* timeline node */}
      <span
        className="absolute left-[10px] top-7 w-4 h-4 z-10"
        style={{ background: "var(--navy)", border: "2px solid var(--ink)", borderRadius: "50%" }}
        aria-hidden
      />
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: 30, rotate: edu.rotate * 3 }}
        animate={inView ? { opacity: 1, x: 0, rotate: edu.rotate } : {}}
        transition={{ duration: 0.65, delay: index * 0.1, ease: EASE }}
      >
        <PaperCard seed={600 + index} lined>
          <div className="p-6">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="display text-2xl leading-tight" style={{ color: "var(--ink)" }}>
                  {edu.school}
                </h3>
                <p className="hand text-base" style={{ color: "var(--ink-soft)" }}>{edu.degree}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs" style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>{edu.period}</p>
                <p className="text-xs" style={{ color: "var(--muted-soft)" }}>{edu.location}</p>
                {edu.gpa && (
                  <p className="hand text-sm mt-0.5" style={{ color: "var(--red)", fontWeight: 700 }}>GPA {edu.gpa}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {edu.coursework.map((c) => (
                <span
                  key={c}
                  className="hand text-sm px-2.5 py-0.5"
                  style={{ border: "1.5px solid var(--pencil)", borderRadius: 4, color: "var(--ink-soft)" }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </PaperCard>
      </motion.div>
    </div>
  );
}

export default function Education() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="education" className="relative overflow-hidden py-28 px-4">
      <MarginDoodles set="education" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16"
        >
          <span className="scrawl-label">04 / where I studied</span>
          <h2 className="relative inline-block mt-2 text-6xl md:text-7xl" style={{ color: "var(--ink)" }}>
            Education
            <ScribbleUnderline seed={404} color="var(--navy)" />
          </h2>
        </motion.div>

        {/* timeline spine */}
        <div className="relative">
          <span
            className="absolute left-[17px] top-2 bottom-2 w-0"
            style={{ borderLeft: "2.5px dashed var(--pencil)" }}
            aria-hidden
          />
          <div className="flex flex-col gap-8">
            {EDUCATION.map((edu, i) => (
              <EduCard key={edu.school} edu={edu} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
