const { GoogleGenerativeAI } = require("@google/generative-ai");
const winston = require("winston");
const { executeTool, getToolsForRole, normalizeRole } = require("./aiToolExecutor");

const supportedLanguages = {
  en: "English",
  am: "Amharic",
  so: "Somali",
  af: "Afaan Oromo",
};

const easternCitiesInstructions = `You are the EasternCities Enterprise AI Support Assistant for a rental marketplace.
Be friendly, professional, concise, and accurate, like Airbnb support.
Never invent listings, bookings, users, payments, or platform data.
Always use backend tools for marketplace data, user data, admin data, policies, and recommendations.
Gemini must never ask for or receive passwords, JWT tokens, OTPs, payment card details, or environment variables.
Do not output HTML. Markdown is allowed.
For listing results, prefer a short explanation plus strict JSON code blocks for rich cards:
\`\`\`json
{"type":"listing_card","data":{"id":"LISTING_ID","title":"Listing title","pricePerDay":450,"city":"Harar","imageUrl":null}}
\`\`\`
For escalation, output:
\`\`\`json
{"type":"smart_escalation","options":["create_ticket","help_center"]}
\`\`\`
Do not perform destructive actions automatically. If a user asks to delete, reject, approve, cancel, or remove something, explain that confirmation in the application UI is required.
If a tool returns no data, say "I couldn't find that information." and offer a smart escalation.`;

function normalizeMessages(messages) {
  return messages
    .map((message) => ({
      role:
        message.sender === "bot" ||
        message.role === "assistant" ||
        message.role === "model"
          ? "model"
          : "user",
      parts: [{ text: message.text.trim().slice(0, 2000) }],
    }))
    .filter((message) => message.parts[0].text)
    .slice(-12);
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    role: normalizeRole(user.role),
    email: user.email,
    name: user.name,
  };
}

function writeSse(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function auditTool({ user, role, toolName, startedAt, success }) {
  winston.info("[AI Audit]", {
    userId: user?.id || "GUEST",
    role,
    toolName,
    executionTimeMs: Date.now() - startedAt,
    success,
    timestamp: new Date().toISOString(),
  });
}

async function streamAiChat({ req, res }) {
  winston.info("[AI Chat] Incoming request", {
    hasAuth: !!req.headers.authorization,
    userId: req.user?.id || "GUEST",
    role: req.user?.role || "GUEST",
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Invalid Gemini API Key or API Key Missing.");
  }

  const language = req.validatedBody.language;
  const messages = normalizeMessages(req.validatedBody.messages);
  const lastMessage = messages[messages.length - 1];

  winston.info("[AI Chat] Payload parsed", { language, messageCount: messages.length });

  if (!lastMessage || lastMessage.role !== "user") {
    throw new Error("Please enter a valid user message.");
  }

  const user = sanitizeUser(req.user);
  const role = normalizeRole(user?.role);
  const tools = getToolsForRole(role);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  winston.info("[AI Chat] Initialization", { role, modelName, toolCount: tools.length });

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: {
      parts: [
        {
          text: `${easternCitiesInstructions}\nReply in ${supportedLanguages[language]}. Current assistant role permissions: ${role}.`,
        },
      ],
    },
    tools: tools.length ? [{ functionDeclarations: tools }] : undefined,
  });

  res.status(200).set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  // ---- Conversation History Fix ----
  // Remove any leading assistant (model) messages such as the welcome greeting.
  const cleanedMessages = [...messages];
  while (cleanedMessages.length && cleanedMessages[0].role === "model") {
    cleanedMessages.shift();
  }

  // Ensure we have at least one user message (the latest prompt).
  if (cleanedMessages.length === 0) {
    winston.warn("[AI Chat] No valid messages after cleaning; aborting.");
    res.status(400).json({ success: false, message: "No valid user messages." });
    return;
  }

  const history = cleanedMessages.slice(0, -1);
  const userMessage = cleanedMessages[cleanedMessages.length - 1];

  winston.info("[AI Chat] Final conversation history", {
    historyLength: history.length,
    firstRole: history[0]?.role,
    lastRole: history[history.length - 1]?.role,
  });
  winston.info("[AI Chat] User message to send", { text: userMessage.parts[0].text });

  const chat = model.startChat({ history });

  winston.info("[AI Chat] Streaming started");
  let currentStream = await chat.sendMessageStream(userMessage.parts[0].text);
  let callCount = 0;

  while (callCount < 5) {
    let functionCall = null;
    let hasOutput = false;

    for await (const chunk of currentStream.stream) {
      const calls = chunk.functionCalls?.() || [];
      if (calls.length) {
        functionCall = calls[0];
        hasOutput = true;
        winston.info("[AI Chat] Tool Requested:", { name: functionCall.name, args: functionCall.args });
        break;
      }

      const text = chunk.text?.() || "";
      if (text) {
        hasOutput = true;
        winston.info("[AI Chat] SSE Chunk Sent");
        writeSse(res, { type: "delta", text });
      }
    }

    // If Gemini returned nothing (no text and no function calls), send a placeholder response to satisfy the API.
    if (!hasOutput && !functionCall) {
      winston.warn("[AI Chat] Empty Gemini response; sending fallback message.");
      writeSse(res, { type: "delta", text: "I couldn't formulate a response at this time." });
      break;
    }

    if (!functionCall) break;

    callCount += 1;
    const startedAt = Date.now();
    let toolResult;
    try {
      toolResult = await executeTool(functionCall.name, functionCall.args || {}, user);
      winston.info("[AI Chat] Tool Result Success:", { name: functionCall.name });
    } catch (err) {
      winston.error(`[AI Chat] Tool execution failed for ${functionCall.name}`, err);
      if (process.env.NODE_ENV === "development") {
        throw new Error(`Tool execution failed: ${err.message || err}`);
      } else {
        toolResult = { success: false, error: "An internal error occurred." };
      }
    }

    auditTool({
      user,
      role,
      toolName: functionCall.name,
      startedAt,
      success: toolResult?.success !== false,
    });

    winston.info("[AI Chat] Sending tool response to Gemini");
    currentStream = await chat.sendMessageStream([
      {
        functionResponse: {
          name: functionCall.name,
          response: toolResult,
        },
      },
    ]);
  }

  if (callCount >= 5) {
    winston.warn("[AI Chat] Tool loop limit reached.");
    writeSse(res, {
      type: "delta",
      text: "\n\nI could not complete that request safely because too many tool calls were needed.",
    });
  }

  winston.info("[AI Chat] Stream done");
  writeSse(res, { type: "done" });
  res.end();
}

module.exports = {
  streamAiChat,
};
