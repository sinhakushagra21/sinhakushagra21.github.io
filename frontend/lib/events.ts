const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ActivityEvent {
  type: string;
  detail: string;
  place: string;
  ts: number;
}

let cachedPlace: string | null = null;
export function setVisitorPlace(place: string | null) {
  cachedPlace = place;
}

/** Fire-and-forget interaction logging. Never throws, never blocks the UI. */
export function logEvent(type: string, detail?: string) {
  try {
    fetch(`${API}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, detail: detail ?? "", place: cachedPlace ?? "" }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Private: returns events if the key is valid, null otherwise. */
export async function fetchEvents(key: string): Promise<ActivityEvent[] | null> {
  try {
    const r = await fetch(`${API}/api/events?key=${encodeURIComponent(key)}`);
    if (!r.ok) return null;
    const d = await r.json();
    return (d.events ?? []) as ActivityEvent[];
  } catch {
    return null;
  }
}
