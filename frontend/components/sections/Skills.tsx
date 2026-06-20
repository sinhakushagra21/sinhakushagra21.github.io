"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import PaperCard from "@/components/sketch/PaperCard";
import ScribbleUnderline from "@/components/sketch/ScribbleUnderline";
import MarginDoodles from "@/components/sketch/MarginDoodles";

const EASE = [0.22, 1, 0.36, 1] as const;

const SKILL_GROUPS = [
  { label: "Languages", icon: "✎", skills: ["Python", "Go", "Java", "SQL", "JavaScript", "C++", "PL/SQL"], rotate: -1.5 },
  { label: "Frameworks", icon: "❏", skills: ["FastAPI", "Flask", "Django", "Spring Boot", "Gin"], rotate: 1.2 },
  { label: "APIs & Protocols", icon: "⇄", skills: ["REST APIs", "gRPC", "Protobuf", "OAuth", "JWT"], rotate: -0.8 },
  { label: "Distributed Systems", icon: "⚙", skills: ["Apache Kafka", "RabbitMQ", "Microservices", "Event-Driven", "Concurrency", "Multithreading"], rotate: 1.6 },
  { label: "Databases", icon: "▤", skills: ["Redis", "Elasticsearch", "PostgreSQL", "MySQL", "MongoDB", "DynamoDB", "Cassandra", "Oracle"], rotate: -1.1 },
  { label: "Cloud & DevOps", icon: "☁", skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions", "Linux"], rotate: 1.0 },
  { label: "AI-Assisted Dev", icon: "✸", skills: ["LangGraph", "LangChain", "RAG", "Vector Search", "Pinecone", "FAISS", "LangSmith", "Copilot", "Cursor", "Claude"], rotate: -1.4 },
];

export default function Skills() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="skills" className="relative overflow-hidden py-28 px-4">
      <MarginDoodles set="skills" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16"
        >
          <span className="scrawl-label">03 / my toolbox</span>
          <h2 className="relative inline-block mt-2 text-6xl md:text-7xl" style={{ color: "var(--ink)" }}>
            Skills
            <ScribbleUnderline seed={303} color="var(--navy)" />
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {SKILL_GROUPS.map((group, gi) => (
            <SkillGroup key={group.label} group={group} groupIndex={gi} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillGroup({ group, groupIndex }: { group: (typeof SKILL_GROUPS)[0]; groupIndex: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, rotate: group.rotate * 3 }}
      animate={inView ? { opacity: 1, y: 0, rotate: group.rotate } : {}}
      transition={{ duration: 0.6, delay: groupIndex * 0.08, ease: EASE }}
      whileHover={{ rotate: 0, scale: 1.02 }}
    >
      <PaperCard seed={500 + groupIndex} variant="note" tape className="h-full">
        <div className="p-5 pt-6">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="display text-2xl" style={{ color: "var(--red)" }} aria-hidden>
              {group.icon}
            </span>
            <h3 className="hand text-lg" style={{ color: "var(--ink)", fontWeight: 700 }}>
              {group.label}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill, si) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: groupIndex * 0.08 + si * 0.04, ease: "easeOut" }}
                className="skill-chip hand text-sm px-2.5 py-0.5 cursor-default"
                style={{
                  border: "1.5px solid var(--ink)",
                  borderRadius: 4,
                  color: "var(--ink-soft)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--highlighter)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </PaperCard>
    </motion.div>
  );
}
