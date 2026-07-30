import { API_BASE_URL } from "./apiClient.js";

const DEFAULT_AI_ERROR = "The AI assistant is temporarily unavailable. Please try again later.";

function sanitizeAiErrorMessage(message) {
  const value = String(message || "");
  const lowerValue = value.toLowerCase();

  if (
    lowerValue.includes("429") ||
    lowerValue.includes("quota") ||
    lowerValue.includes("too many requests") ||
    lowerValue.includes("rate-limit") ||
    lowerValue.includes("rate limits")
  ) {
    const retryMatch = value.match(/retry in\s+([\d.]+)s/i) || value.match(/"retryDelay":"(\d+)s"/i);
    const retryText = retryMatch ? ` Please try again in about ${Math.ceil(Number(retryMatch[1]))} seconds.` : " Please try again later.";
    return `The AI assistant has reached its current usage limit.${retryText}`;
  }

  if (lowerValue.includes("api key") || lowerValue.includes("backend error") || lowerValue.includes("googlegenerativeai")) {
    return DEFAULT_AI_ERROR;
  }

  return value || DEFAULT_AI_ERROR;
}

async function readError(response) {
  const payload = await response.json().catch(() => null);
  return sanitizeAiErrorMessage(payload?.message);
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
        throw new Error(sanitizeAiErrorMessage(payload.message));
      }
    }
  }

  if (!answer) {
    throw new Error("The AI assistant did not return a response. Please try again.");
  }

  return answer;
}
