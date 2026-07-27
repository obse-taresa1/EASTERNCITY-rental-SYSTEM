const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const supportedLanguages = {
  en: "English",
  am: "Amharic",
  so: "Somali",
  af: "Afaan Oromo",
};

const easternCitiesInstructions = `You are the EasternCities AI assistant for a rental marketplace.
You are helpful, concise, professional, and accurate.
Specialize in renting properties, listings, user accounts, verification, dashboards,
categories, contacting owners, platform policies, and frequently asked questions.
For questions outside EasternCities, answer normally and briefly.
Do not invent platform policies, availability, prices, account status, or actions.
Do not claim to access private account data or perform actions on behalf of a user.
If a user needs account-specific help, direct them to the relevant EasternCities dashboard,
listing owner, or support channel.`;

const chatRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many chat requests. Please try again in a few minutes.",
  },
});

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => message && typeof message.text === "string")
    .map((message) => ({
      role: message.sender === "bot" || message.role === "assistant" ? "assistant" : "user",
      content: message.text.trim().slice(0, 2000),
    }))
    .filter((message) => message.content)
    .slice(-12);
}

router.post("/", chatRateLimit, async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const language = supportedLanguages[req.body?.language]
      ? req.body.language
      : "en";
    const messages = normalizeMessages(req.body?.messages);

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: "The Gemini assistant is not configured yet. Please try again later.",
      });
    }

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return res.status(400).json({
        success: false,
        message: "Please enter a message for the assistant.",
      });
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
      {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${easternCitiesInstructions}\nReply in ${supportedLanguages[language]}.`,
            },
          ],
        },
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
      }),
      },
    );

    if (!upstream.ok || !upstream.body) {
      const error = new Error(
        upstream.status === 429
          ? "The Gemini assistant has reached its current usage limit. Please try again later."
          : "The Gemini service is temporarily unavailable.",
      );
      error.statusCode = upstream.status === 401 ? 503 : 502;
      throw error;
    }

    res.status(200);
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        const dataLine = event
          .split("\n")
          .find((line) => line.startsWith("data:"));

        if (!dataLine) continue;

        const payload = dataLine.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        let parsed;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }

        const text = parsed.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("");

        if (text) {
          res.write(`data: ${JSON.stringify({ type: "delta", text })}\n\n`);
        }

        if (parsed.error) {
          const hasQuotaError = parsed.error.code === "RESOURCE_EXHAUSTED";
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              message: hasQuotaError
                ? "The Gemini assistant has reached its current usage limit. Please try again later."
                : "The Gemini service could not complete the request.",
            })}\n\n`,
          );
        }
      }
    }

    res.end();
  } catch (error) {
    if (!res.headersSent) return next(error);

    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "The Gemini service is temporarily unavailable. Please try again.",
      })}\n\n`,
    );
    res.end();
  }
});

module.exports = router;
