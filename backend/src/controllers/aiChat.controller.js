const aiChatService = require("../services/aiChat.service");

function isAiProviderUnavailable(error) {
  const rawMessage = String(error?.message || error || "");
  const lowerMessage = rawMessage.toLowerCase();

  return (
    error?.status === 429 ||
    lowerMessage.includes("429") ||
    lowerMessage.includes("quota") ||
    lowerMessage.includes("too many requests") ||
    lowerMessage.includes("rate-limit") ||
    lowerMessage.includes("rate limits") ||
    lowerMessage.includes("api key") ||
    lowerMessage.includes("invalid gemini") ||
    lowerMessage.includes("googlegenerativeai")
  );
}

function getLastUserMessage(req) {
  const messages = req.validatedBody?.messages || req.body?.messages || [];
  const lastUserMessage = [...messages].reverse().find((message) => {
    const sender = message?.sender || message?.role;
    return sender === "user" || sender === undefined;
  });

  return String(lastUserMessage?.text || lastUserMessage?.content || "").trim();
}

function buildFallbackAnswer(req) {
  const message = getLastUserMessage(req).toLowerCase();

  if (message.includes("rent") || message.includes("book") || message.includes("car")) {
    return [
      "You can rent an item from EasternCities like this:",
      "",
      "1. Search or open the category you need, for example Cars & Bikes.",
      "2. Open the listing and check the price, location, owner, and availability.",
      "3. Click **View Details** or **Book Now**.",
      "4. Select your rental dates and submit the booking request.",
      "5. Wait for the owner to confirm, then arrange pickup and payment directly with the owner.",
      "",
      "Rental payments are not handled by the platform. Users pay each other physically or in person.",
    ].join("\n");
  }

  if (message.includes("list") || message.includes("post") || message.includes("item")) {
    return [
      "To create a listing:",
      "",
      "1. Log in to your account.",
      "2. Open **Dashboard > Add New Listing**.",
      "3. Fill in the item details, category, city, sefer, price, and images.",
      "4. Upload the listing fee payment screenshot if required.",
      "5. Submit the listing for admin review.",
      "",
      "The listing appears publicly only after admin approval.",
    ].join("\n");
  }

  if (message.includes("verify") || message.includes("id")) {
    return [
      "To verify your account:",
      "",
      "1. Open **Dashboard > Verification Center**.",
      "2. Enter your city, sefer, and address.",
      "3. Upload the front and back of your National ID.",
      "4. Submit the request.",
      "",
      "An admin will review it. Your dashboard will show Pending, Verified, or Rejected based on the review result.",
    ].join("\n");
  }

  if (message.includes("payment") || message.includes("pay") || message.includes("fee")) {
    return [
      "EasternCities uses platform payments only for listing fees and promotion payments.",
      "",
      "Rental booking payments are handled directly between users in person. The platform does not collect rental booking payments.",
      "",
      "For listing or promotion payments, upload the payment screenshot and wait for admin review.",
    ].join("\n");
  }

  if (message.includes("support") || message.includes("help") || message.includes("ticket")) {
    return [
      "For support, open **Dashboard > Help Center** or submit a support ticket from your dashboard.",
      "",
      "Include a clear subject, your issue, and any listing or booking details so the admin team can help faster.",
    ].join("\n");
  }

  return [
    "I can help with EasternCities rentals, listings, bookings, verification, payments, and support.",
    "",
    "Try asking things like:",
    "- How do I rent a car?",
    "- How do I create a listing?",
    "- How do I verify my account?",
    "- How do listing fee payments work?",
  ].join("\n");
}

function writeFallbackStream(req, res) {
  const answer = buildFallbackAnswer(req);

  if (!res.headersSent) {
    res.status(200).set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders?.();
  }

  res.write(`data: ${JSON.stringify({ type: "delta", text: answer })}\n\n`);
  res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
  return res.end();
}

async function streamChat(req, res, next) {
  try {
    await aiChatService.streamAiChat({ req, res });
  } catch (error) {
    console.error("[AI Chat Backend Error]:", error);

    if (isAiProviderUnavailable(error)) {
      return writeFallbackStream(req, res);
    }

    const errorMsg = "The AI assistant is temporarily unavailable. Please try again later.";

    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: errorMsg });
    }

    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: errorMsg,
      })}\n\n`,
    );
    return res.end();
  }
}

module.exports = {
  streamChat,
};
