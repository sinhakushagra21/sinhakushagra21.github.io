import { Message } from "./types";

/**
 * Encode/decode a conversation into a URL-safe base64 string so a chat can be
 * shared via a link (?c=…) with no server storage. Only role + content travel;
 * sources/streaming flags are dropped to keep the URL short.
 */
type Slim = { r: "u" | "a"; c: string };

export function encodeConversation(messages: Message[]): string {
  const slim: Slim[] = messages
    .filter((m) => m.content.trim())
    .map((m) => ({ r: m.role === "user" ? "u" : "a", c: m.content }));
  const bytes = new TextEncoder().encode(JSON.stringify(slim));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeConversation(
  s: string,
): { role: "user" | "assistant"; content: string }[] {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const arr = JSON.parse(new TextDecoder().decode(bytes)) as Slim[];
    return arr
      .filter((m) => m && typeof m.c === "string")
      .map((m) => ({
        role: m.r === "u" ? "user" : "assistant",
        content: String(m.c),
      }));
  } catch {
    return [];
  }
}
