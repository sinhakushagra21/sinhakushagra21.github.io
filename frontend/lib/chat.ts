import { Message, Source } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface StreamCallbacks {
  onStatus: (text: string) => void;
  onToken: (text: string) => void;
  onSources: (sources: Source[], lowConfidence: boolean) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}

export async function streamChat(
  messages: Pick<Message, "role" | "content">[],
  callbacks: StreamCallbacks
) {
  return streamSSE(`${API_URL}/api/chat`, { messages }, callbacks);
}

/** Recruiter mode: tailor Kushagra's pitch to a pasted job description. */
export async function streamTailor(
  jobDescription: string,
  callbacks: StreamCallbacks
) {
  return streamSSE(
    `${API_URL}/api/tailor`,
    { job_description: jobDescription },
    callbacks
  );
}

async function streamSSE(
  url: string,
  body: unknown,
  callbacks: StreamCallbacks
) {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    callbacks.onError("Failed to reach the server. Is the backend running?");
    return;
  }

  if (!res.ok || !res.body) {
    callbacks.onError("Failed to reach the chat server.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;

      let frame: Record<string, unknown>;
      try {
        frame = JSON.parse(raw);
      } catch {
        continue;
      }

      switch (frame.type) {
        case "meta":
          callbacks.onSources(
            frame.sources as Source[],
            frame.low_confidence as boolean
          );
          break;
        case "status":
          callbacks.onStatus(frame.text as string);
          break;
        case "token":
          callbacks.onToken(frame.text as string);
          break;
        case "error":
          callbacks.onError(frame.text as string);
          break;
        case "done":
          callbacks.onDone();
          return;
      }
    }
  }

  callbacks.onDone();
}
