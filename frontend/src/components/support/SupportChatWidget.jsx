import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { streamAiChat } from "../../services/aiChatService.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CHAT_HISTORY_KEY = "ec_enterprise_ai_chat_history";

const chatCopy = {
  en: {
    greeting: "Hello. I am the EasternCities AI assistant. I can help with rentals, listings, verification, accounts, and using the platform.",
    placeholder: "Ask about EasternCities...",
    unavailable: "I am currently unable to answer. Please try again later.",
    suggestions: {
      GUEST: ["How do I rent a car?", "Search for cameras", "Payment guide"],
      USER: ["How do I verify my account?", "My Bookings", "My Listings"],
      ADMIN: ["Pending Listings", "Platform Stats", "Recent Support Tickets"],
      SUPER_ADMIN: ["Platform Stats", "System Health", "Recent Support Tickets"]
    }
  },
  // Adding minimal fallbacks for others to keep it concise
  am: { greeting: "ሰላም። የEasternCities AI ረዳት ነኝ።", placeholder: "ስለ EasternCities ይጠይቁ...", unavailable: "አልተሳካም።", suggestions: { GUEST: [] } }
};

function createMessage(sender, text) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    sender,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function parseJsonBlocks(text) {
  const parts = [];
  const regex = /```json\s*([\s\S]*?)\s*```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'markdown', content: text.slice(lastIndex, match.index) });
    }
    try {
      const data = JSON.parse(match[1].trim());
      parts.push({ type: 'json_card', data });
    } catch (e) {
      parts.push({ type: 'markdown', content: match[0] });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'markdown', content: text.slice(lastIndex) });
  }
  
  if (parts.length === 0) return [{ type: 'markdown', content: text }];
  return parts;
}

function RichCard({ cardData }) {
  if (cardData.type === 'listing_card') {
    const { id, title, price, pricePerDay, city, imageUrl } = cardData.data;
    const displayPrice = pricePerDay ?? price ?? 0;
    return (
      <div className="ec-rich-card listing-card">
        {imageUrl && <img src={imageUrl} alt={title} className="ec-rich-card-img" />}
        <div className="ec-rich-card-body">
          <h4>{title}</h4>
          <p>{city} - ETB {displayPrice}/day</p>
          <div className="ec-rich-card-actions">
            <a href={`/items/${id}`} className="btn-view">View Details</a>
            <a href={`/booking/${id}`} className="btn-book">Book Now</a>
          </div>
        </div>
      </div>
    );
  }
  if (cardData.type === 'smart_escalation') {
    return (
      <div className="ec-rich-card escalation-card">
        <h4>Need more help?</h4>
        <div className="ec-escalation-actions">
          {cardData.options?.includes("create_ticket") && <a href="/dashboard/support" className="btn-outline">Create Support Ticket</a>}
          {cardData.options?.includes("contact_owner") && <button className="btn-outline">Contact Owner</button>}
          {cardData.options?.includes("help_center") && <a href="/help" className="btn-outline">View Help Center</a>}
        </div>
      </div>
    );
  }
  return <pre>{JSON.stringify(cardData, null, 2)}</pre>;
}

export default function SupportChatWidget() {
  const { language, t } = useLanguage();
  const { accessToken, role } = useAuth();
  
  const copy = chatCopy[language] || chatCopy.en;
  const activeRole = role ? role.toUpperCase() : "GUEST";
  const suggestions = copy.suggestions?.[activeRole] || copy.suggestions?.GUEST || [];

  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(CHAT_HISTORY_KEY));
      if (stored?.length) return stored;
    } catch {}
    return [createMessage("bot", copy.greeting)];
  });

  useEffect(() => {
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function sendMessage(text) {
    const value = text.trim();
    if (!value || isLoading) return;

    const userMessage = createMessage("user", value);
    const assistantMessage = createMessage("bot", "");
    const nextMessages = [...messages, userMessage, assistantMessage];
    const controller = new AbortController();

    setMessage("");
    setMessages(nextMessages);
    setIsLoading(true);
    abortControllerRef.current = controller;

    try {
      await streamAiChat({
        messages: nextMessages.slice(0, -1),
        language,
        token: accessToken,
        signal: controller.signal,
        onDelta: (textDelta) => {
          setMessages((current) =>
            current.map((item) => item.id === assistantMessage.id ? { ...item, text: textDelta } : item)
          );
        },
      });
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("[AI Chat Error Frontend]:", error);
      const errorText = error.message || copy.unavailable;
      setMessages((current) =>
        current.map((item) => item.id === assistantMessage.id ? { ...item, text: errorText } : item)
      );
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }

  function clearChat() {
    abortControllerRef.current?.abort();
    setMessages([createMessage("bot", copy.greeting)]);
  }

  return (
    <section className={`cw-support-widget ${isOpen ? "is-open" : ""} ${isMinimized ? "is-minimized" : ""}`.trim()} aria-label="EasternCities AI chat">
      <button className="cw-support-launcher" onClick={() => { setIsOpen(true); setIsMinimized(false); }}>
        <i className="bi bi-robot"></i>
        <span>Ask AI</span>
      </button>

      <div className="cw-chat-panel">
        <header className="cw-chat-header glass-effect">
          <div className="cw-chat-avatar"><i className="bi bi-robot"></i></div>
          <div className="cw-chat-title">
            <h2>EasternCities AI</h2>
            <p><span className="online-dot"></span>Online</p>
          </div>
          <div className="cw-chat-actions">
            <button onClick={clearChat} title="Clear"><i className="bi bi-trash3"></i></button>
            <button onClick={() => setIsMinimized(!isMinimized)} title="Minimize"><i className="bi bi-dash-lg"></i></button>
            <button onClick={() => setIsOpen(false)} title="Close"><i className="bi bi-x-lg"></i></button>
          </div>
        </header>

        <div className="cw-chat-messages">
          {messages.map((item) => (
            <div key={item.id} className={`cw-chat-message ${item.sender}`}>
              <div className="cw-chat-bubble">
                {item.text ? (
                  parseJsonBlocks(item.text).map((part, i) => {
                    if (part.type === 'markdown') {
                      return <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>{part.content}</ReactMarkdown>;
                    }
                    return <RichCard key={i} cardData={part.data} />;
                  })
                ) : (
                  isLoading && item.sender === "bot" && (
                    <span className="cw-chat-typing"><span></span><span></span><span></span></span>
                  )
                )}
              </div>
              {item.text && <time className="cw-chat-time">{item.time}</time>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="cw-chat-suggestions">
          {suggestions.map((sug) => (
            <button key={sug} disabled={isLoading} onClick={() => sendMessage(sug)}>{sug}</button>
          ))}
        </div>

        <form className="cw-chat-form" onSubmit={(e) => { e.preventDefault(); sendMessage(message); }}>
          <textarea
            rows="1"
            placeholder={copy.placeholder}
            value={message}
            disabled={isLoading}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(message); } }}
          />
          <button type="submit" disabled={isLoading || !message.trim()}><i className="bi bi-send-fill"></i></button>
        </form>
      </div>
    </section>
  );
}
