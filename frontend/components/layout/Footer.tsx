"use client";

import { Mail, FileText } from "lucide-react";

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

const iconLink = (color: string) => ({
  color,
  transition: "color 0.2s, transform 0.2s",
});

export default function Footer() {
  return (
    <footer
      className="relative z-10 py-10 px-4"
      style={{ background: "var(--surface-dark)", borderTop: "3px dashed var(--pencil)" }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="hand text-base" style={{ color: "var(--on-dark-soft)" }}>
          © {new Date().getFullYear()} Kushagra Sinha · drawn in Boston, MA{" "}
          <button
            onClick={() => window.dispatchEvent(new Event("open-notes-inbox"))}
            className="opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "var(--on-dark-soft)" }}
            aria-label="Open notes inbox"
            title="notes"
          >
            · notes
          </button>
        </p>

        <div className="flex items-center gap-4">
          {[
            { href: "https://github.com/sinhakushagra21", label: "GitHub", Icon: GithubIcon },
            { href: "https://linkedin.com/in/kushagra-2198", label: "LinkedIn", Icon: LinkedinIcon },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={iconLink("var(--on-dark-soft)")}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--on-dark)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--on-dark-soft)")}
              aria-label={label}
            >
              <Icon size={16} />
            </a>
          ))}
          <a
            href="mailto:kushagra.2198@gmail.com"
            style={iconLink("var(--on-dark-soft)")}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--on-dark)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--on-dark-soft)")}
            aria-label="Email"
          >
            <Mail size={16} />
          </a>
          <a
            href="/resume.pdf"
            download
            className="hand flex items-center gap-1.5 text-sm px-3.5 py-1.5 transition-transform hover:-rotate-2 hover:scale-105"
            style={{ background: "var(--red)", color: "#fff", border: "2px solid #fff", borderRadius: 4, fontWeight: 700 }}
            aria-label="Download resume"
          >
            <FileText size={13} />
            Resume
          </a>
        </div>
      </div>
    </footer>
  );
}
