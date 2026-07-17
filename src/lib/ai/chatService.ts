// Modular AI response service.
// The chat UI never talks to a provider directly — it calls sendChat() here.
// Today this streams from our Supabase edge function (which uses Lovable AI Gateway).
// Tomorrow we can swap the transport (OpenAI, Claude, Gemini direct, etc.) without touching the UI.

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatContext = {
  name?: string;
  email?: string;
  role?: string;
  route?: string;
};

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dhanvantara-chat`;
const AUTH_HEADER = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

export async function sendChat(
  messages: ChatMessage[],
  context: ChatContext,
  opts: { signal?: AbortSignal; onDelta: (chunk: string) => void }
): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    signal: opts.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH_HEADER,
    },
    body: JSON.stringify({ messages, context }),
  });

  if (!res.ok || !res.body) {
    let err = "The assistant is temporarily unavailable.";
    try {
      const j = await res.json();
      if (j?.error) err = j.error;
    } catch { /* noop */ }
    throw new Error(err);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const j = JSON.parse(payload);
        const delta = j?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length) opts.onDelta(delta);
      } catch { /* skip malformed frame */ }
    }
  }
}
