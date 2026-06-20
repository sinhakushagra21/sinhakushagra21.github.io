const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Note {
  name: string;
  message: string;
  ts: number;
}

export async function postNote(name: string, message: string): Promise<boolean> {
  try {
    const r = await fetch(`${API_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Returns notes if the key is valid, null on auth failure / error. */
export async function fetchNotes(key: string): Promise<Note[] | null> {
  try {
    const r = await fetch(`${API_URL}/api/notes?key=${encodeURIComponent(key)}`);
    if (!r.ok) return null;
    const d = await r.json();
    return (d.notes ?? []) as Note[];
  } catch {
    return null;
  }
}
