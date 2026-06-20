"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import CircleWord from "@/components/sketch/CircleWord";

const LINKS = [
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const ids = ["experience", "projects", "skills", "education", "contact"];
    const handler = () => {
      setScrolled(window.scrollY > 20);
      const offset = window.innerHeight * 0.35;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < offset) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "color-mix(in srgb, var(--paper) 86%, transparent)" : "transparent",
        borderBottom: scrolled ? "2px dashed var(--pencil)" : "2px dashed transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
      }}
    >
      <nav className="w-full px-5 sm:px-8 h-16 flex items-center justify-between">
        <a
          href="#home"
          className="display text-3xl leading-none transition-transform hover:-rotate-3"
          style={{ color: "var(--ink)", fontWeight: 700 }}
        >
          KS
        </a>

        <div className="hidden md:flex items-center gap-7">
          {LINKS.map((link) => {
            const sectionId = link.href.replace("#", "");
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.href}
                href={link.href}
                className="hand relative text-base tracking-wide transition-colors duration-200 py-1"
                style={{ color: isActive ? "var(--ink)" : "var(--ink-faint)", fontWeight: isActive ? 700 : 400 }}
              >
                <span className="relative inline-block">
                  {link.label}
                  {isActive && <CircleWord seed={sectionId.length * 7 + 3} />}
                </span>
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ color: "var(--ink-faint)" }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{
              background: "color-mix(in srgb, var(--paper) 96%, transparent)",
              borderTop: "2px dashed var(--pencil)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex flex-col py-3">
              {LINKS.map((link) => {
                const isActive = activeSection === link.href.replace("#", "");
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="hand px-4 py-3 text-lg transition-colors duration-200"
                    style={{ color: isActive ? "var(--red)" : "var(--ink-soft)", fontWeight: isActive ? 700 : 400 }}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
