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

  if (/\b(rent|rental|book|booking|car|vehicle)\b/.test(message)) {
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

  if (/\b(create|add|submit|post|publish).*(listing|item)\b|\b(listing|item).*(create|add|submit|post|publish)\b/.test(message)) {
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

  if (/\b(verify|verification|national id|identity|id card)\b/.test(message)) {
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

  if (/\b(payment|pay|fee|receipt|proof|promotion)\b/.test(message)) {
    return [
      "EasternCities uses platform payments only for listing fees and promotion payments.",
      "",
      "Rental booking payments are handled directly between users in person. The platform does not collect rental booking payments.",
      "",
      "For listing or promotion payments, upload the payment screenshot and wait for admin review.",
    ].join("\n");
  }

  if (/\b(search|find|filter|category|city|sefer|neighbou?rhood|price)\b/.test(message)) {
    return [
      "To find a rental item:",
      "",
      "1. Use the Home page search form or open **Categories**.",
      "2. Filter by keyword, category, city, sefer (neighbourhood), maximum price, condition, or listing type.",
      "3. Combine filters to narrow the results.",
      "4. Open **View Details** to see the owner, images, price, and booking option.",
      "",
      "Only approved listings are shown publicly.",
    ].join("\n");
  }

  if (/\b(save|saved|favourite|favorite|heart|wishlist)\b/.test(message)) {
    return [
      "To save an item, open its listing card or details page and select the heart button.",
      "",
      "Saved items appear in **Dashboard > Saved Items**. Select the heart again to remove an item from your saved list.",
    ].join("\n");
  }

  if (/\b(contact|message|chat|owner)\b/.test(message)) {
    return [
      "To contact an owner, open the listing and select **Contact Owner**.",
      "",
      "Sign in first if requested. The conversation then appears in **Dashboard > Messages**, where you can discuss availability, pickup, delivery, dates, and price.",
    ].join("\n");
  }

  if (/\b(login|log in|sign in|register|sign up|password|reset)\b/.test(message)) {
    return [
      "For account access:",
      "",
      "- Use **Register / Login** in the navigation bar to create an account or sign in.",
      "- Select **Forgot Password** on the login screen to request a password-reset link.",
      "- After signing in, use **Dashboard > Settings** to update your profile information.",
      "",
      "Never share your password, reset token, or one-time code in chat.",
    ].join("\n");
  }

  if (/\b(review|rating)\b/.test(message)) {
    return [
      "Reviews are available after an eligible booking is completed.",
      "",
      "Open **Dashboard > Reviews & Ratings**, choose the completed rental, then submit your rating and comment. Your received reviews are also shown there.",
    ].join("\n");
  }

  if (/\b(community|request|post)\b/.test(message)) {
    return [
      "The Community page lets users publish rental requests and browse requests from other users.",
      "",
      "Sign in, open **Community**, choose the relevant request type, add clear item and location details, and submit. You can contact the post author from the request details page.",
    ].join("\n");
  }

  if (/\b(advertis|banner|campaign)\b/.test(message)) {
    return [
      "To advertise on EasternCities, open **Advertise With Us** and submit your campaign details and banner image.",
      "",
      "After review, follow the payment instructions, upload the receipt when requested, and wait for the administrator to approve or reject the advertising request.",
    ].join("\n");
  }

  if (/\b(support|help|ticket|problem|issue)\b/.test(message)) {
    return [
      "For support, open **Dashboard > Help Center** or submit a support ticket from your dashboard.",
      "",
      "Include a clear subject, your issue, and any listing or booking details so the admin team can help faster.",
    ].join("\n");
  }

  return [
    "I can help with EasternCities rentals, listings, search filters, bookings, verification, payments, saved items, messages, reviews, community requests, advertising, and support.",
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
