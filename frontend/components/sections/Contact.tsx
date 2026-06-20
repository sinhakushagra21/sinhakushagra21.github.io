"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import PaperCard from "@/components/sketch/PaperCard";
import ScribbleUnderline from "@/components/sketch/ScribbleUnderline";
import HighlightMark from "@/components/sketch/HighlightMark";
import MarginDoodles from "@/components/sketch/MarginDoodles";

const EASE = [0.22, 1, 0.36, 1] as const;

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

const LINKS = [
  { icon: Mail, label: "Email", value: "kushagra.2198@gmail.com", href: "mailto:kushagra.2198@gmail.com" },
  { icon: LinkedinIcon, label: "LinkedIn", value: "linkedin.com/in/kushagra-2198", href: "https://linkedin.com/in/kushagra-2198" },
  { icon: GithubIcon, label: "GitHub", value: "github.com/sinhakushagra21", href: "https://github.com/sinhakushagra21" },
  { icon: Phone, label: "Phone", value: "(857) 364-9162", href: "tel:+18573649162" },
  { icon: MapPin, label: "Location", value: "Boston, MA", href: null },
];

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" className="relative overflow-hidden py-28 px-4">
      <MarginDoodles set="contact" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-12"
        >
          <span className="scrawl-label">05 / say hello</span>
          <h2 className="relative inline-block mt-2 text-6xl md:text-7xl" style={{ color: "var(--ink)" }}>
            Contact
            <ScribbleUnderline seed={505} color="var(--navy)" />
          </h2>
          <p className="hand mt-5 text-lg max-w-md mx-auto leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Open to SWE, SDE, and AI Engineer roles starting{" "}
            <HighlightMark>August 2026</HighlightMark>, and{" "}
            <HighlightMark>open to relocation</HighlightMark> anywhere in the US. I require H1B sponsorship (F-1 OPT, standard path).
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -1 }}
          animate={inView ? { opacity: 1, y: 0, rotate: -0.5 } : {}}
          transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
        >
          <PaperCard seed={700} lined>
            <div className="p-8 grid sm:grid-cols-2 gap-5">
              {LINKS.map((link) => (
                <div key={link.label} className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{ background: "var(--paper-card-2)", border: "2px solid var(--ink)", borderRadius: "48% 52% 50% 50% / 52% 48% 52% 48%" }}
                  >
                    <link.icon size={16} style={{ color: "var(--red)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="hand text-sm" style={{ color: "var(--ink-faint)", fontWeight: 700 }}>{link.label}</p>
                    {link.href ? (
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-sm truncate block transition-colors duration-200"
                        style={{ color: "var(--ink-soft)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-soft)")}
                      >
                        {link.value}
                      </a>
                    ) : (
                      <p className="text-sm" style={{ color: "var(--ink-soft)" }}>{link.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PaperCard>
        </motion.div>
      </div>
    </section>
  );
}
