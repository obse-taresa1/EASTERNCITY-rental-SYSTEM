import { API_BASE_URL } from "./apiClient.js";

async function readError(response) {
  const payload = await response.json().catch(() => null);
  return payload?.message || "The AI assistant is temporarily unavailable. Please try again.";
}

export async function streamAiChat({ messages, language, token, signal, onDelta }) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/ai-chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages, language }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(await readError(response));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      const dataLine = event.split("\n").find((line) => line.startsWith("data:"));
      if (!dataLine) continue;

      let payload;
      try {
        payload = JSON.parse(dataLine.slice(5).trim());
      } catch {
        continue;
      }

      if (payload.type === "delta" && payload.text) {
        answer += payload.text;
        onDelta(answer);
      }

      if (payload.type === "error") {
        throw new Error(payload.message);
      }
    }
  }

  if (!answer) {
    throw new Error("The AI assistant did not return a response. Please try again.");
  }

  return answer;
}
