"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { openCalendly, isWorkEmail, isUrl } from "@/lib/calendly";
import SketchBorder from "@/components/sketch/SketchBorder";

/**
 * Gate before scheduling a recruiter screening: a real work email (company
 * domain, not gmail/outlook/etc.) and a link to the actual job posting are
 * mandatory — kills casual spam and gives Kushagra context up front. Opens via
 * the `open-screening` window event; on valid submit, launches Calendly prefilled.
 */
export default function ScreeningForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => {
      setErr(null);
      setOpen(true);
    };
    window.addEventListener("open-screening", handler);
    return () => window.removeEventListener("open-screening", handler);
  }, []);

  function proceed() {
    if (!isWorkEmail(email)) {
      setErr("Please use your work email — a company domain, not gmail/outlook/yahoo/etc.");
      return;
    }
    if (!isUrl(link)) {
      setErr("Add a link to the actual job posting (https://…).");
      return;
    }
    setErr(null);
    openCalendly({ name: name.trim(), email: email.trim(), jobLink: link.trim() });
    setOpen(false);
  }

  const field: React.CSSProperties = {
    background: "var(--paper-card-2)",
    border: "2px solid var(--ink)",
    borderRadius: 4,
    color: "var(--ink)",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(20,20,18,0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="chalkboard relative w-full max-w-md p-6"
            style={{ background: "var(--paper-card)", borderRadius: 8, boxShadow: "3px 5px 0 rgba(0,0,0,0.25)" }}
          >
            <SketchBorder seed={7373} color="var(--ink)" />
            <button onClick={() => setOpen(false)} aria-label="Close" className="absolute top-3 right-3" style={{ color: "var(--ink-faint)" }}>
              <X size={18} />
            </button>

            <h3 className="display text-3xl" style={{ color: "var(--ink)" }}>
              schedule a recruiter screening
            </h3>
            <p className="hand text-sm mb-4" style={{ color: "var(--ink-faint)" }}>
              quick 30 min. work email + the job link required (keeps spam out).
            </p>

            <label className="hand text-sm" style={{ color: "var(--ink-soft)" }}>your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane from Acme"
              className="hand w-full text-base mb-3 mt-1 px-3 py-2 outline-none" style={field} />

            <label className="hand text-sm" style={{ color: "var(--ink-soft)" }}>work email *</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" type="email"
              className="hand w-full text-base mb-3 mt-1 px-3 py-2 outline-none" style={field} />

            <label className="hand text-sm" style={{ color: "var(--ink-soft)" }}>link to the job posting *</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://company.com/careers/swe-123"
              className="hand w-full text-base mt-1 px-3 py-2 outline-none" style={field}
              onKeyDown={(e) => e.key === "Enter" && proceed()} />

            {err && <p className="hand text-sm mt-3" style={{ color: "var(--red)" }}>{err}</p>}

            <div className="mt-5 flex justify-end">
              <button onClick={proceed}
                className="hand text-sm px-4 py-1.5 transition-transform hover:-rotate-1"
                style={{ background: "var(--red)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 4, fontWeight: 700 }}>
                continue to scheduling →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
