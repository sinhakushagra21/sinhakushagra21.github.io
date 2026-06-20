// TODO: Kushagra's scheduling link — update if the Calendly handle changes.
export const CALENDLY_URL = "https://calendly.com/kushagra-2198/30min";

/** Free/personal email domains — booking a screening requires a work domain. */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "yahoo.co.uk",
  "ymail.com", "rocketmail.com", "hotmail.com", "hotmail.co.uk", "outlook.com",
  "live.com", "msn.com", "icloud.com", "me.com", "mac.com", "aol.com",
  "protonmail.com", "proton.me", "pm.me", "gmx.com", "gmx.net", "mail.com",
  "yandex.com", "yandex.ru", "zoho.com", "hey.com", "fastmail.com",
  "rediffmail.com", "qq.com", "163.com", "126.com", "naver.com", "duck.com",
]);

export function isWorkEmail(email: string): boolean {
  const m = /^[^@\s]+@([^@\s]+\.[^@\s]+)$/.exec(email.trim().toLowerCase());
  if (!m) return false;
  return !FREE_EMAIL_DOMAINS.has(m[1]);
}

export function isUrl(s: string): boolean {
  return /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(s.trim());
}

function ensureCalendly(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Calendly) return resolve(true);
    if (!document.getElementById("calendly-css")) {
      const l = document.createElement("link");
      l.id = "calendly-css";
      l.rel = "stylesheet";
      l.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(l);
    }
    const existing = document.getElementById("calendly-js") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const s = document.createElement("script");
    s.id = "calendly-js";
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** Open Calendly, prefilling the recruiter's name/email and the job link
    (as custom answer a1 + UTM so it shows on the booking). */
export async function openCalendly(prefill?: {
  name?: string;
  email?: string;
  jobLink?: string;
}) {
  const ok = await ensureCalendly();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (ok && w.Calendly) {
    w.Calendly.initPopupWidget({
      url: CALENDLY_URL,
      prefill: {
        name: prefill?.name || undefined,
        email: prefill?.email || undefined,
        customAnswers: prefill?.jobLink ? { a1: prefill.jobLink } : undefined,
      },
      utm: prefill?.jobLink ? { utmContent: prefill.jobLink } : undefined,
    });
    return;
  }
  // fallback: open the page in a new tab with prefill params
  const params = new URLSearchParams();
  if (prefill?.email) params.set("email", prefill.email);
  if (prefill?.name) params.set("name", prefill.name);
  if (prefill?.jobLink) params.set("a1", prefill.jobLink);
  const qs = params.toString();
  window.open(`${CALENDLY_URL}${qs ? `?${qs}` : ""}`, "_blank", "noopener,noreferrer");
}
