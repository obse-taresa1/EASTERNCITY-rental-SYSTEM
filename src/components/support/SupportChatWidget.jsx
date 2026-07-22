import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

const suggestions = [
  "How do I submit a complaint?",
  "How do I track my request?",
  "How do I register?",
  "How do I update my profile?",
  "What services are available?",
];

export default function SupportChatWidget() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello, I am the CityWide support assistant. I can help with registration, login, service requests, complaints, tracking, profile updates, notifications, and platform navigation.",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  function sendMessage(text) {
    const value = text.trim();
    if (!value) return;

    setMessages((current) => [
      ...current,
      {
        sender: "user",
        text: value,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      {
        sender: "bot",
        text: "Thanks for your message. CityWide support will guide you through the next step.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(message);
  }

  return (
    <section
      className={`cw-support-widget ${isOpen ? "is-open" : ""} ${
        isMinimized ? "is-minimized" : ""
      }`.trim()}
      data-cw-support
      aria-label="CityWide customer support chat"
    >
      <button
        className="cw-support-launcher"
        type="button"
        aria-label="Open CityWide support chat"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
      >
        <i className="bi bi-headset"></i>
        <span>{t("support")}</span>
      </button>

      <div className="cw-chat-panel" aria-hidden={!isOpen}>
        <header className="cw-chat-header">
          <div className="cw-chat-avatar" aria-hidden="true">
            <i className="bi bi-buildings"></i>
          </div>

          <div className="cw-chat-title">
            <h2>CityWide Support</h2>
            <p>
              <span></span>Online assistant
            </p>
          </div>

          <div className="cw-chat-actions">
            <button
              type="button"
              aria-label="Clear chat"
              title="Clear chat"
              onClick={() => setMessages([])}
            >
              <i className="bi bi-trash3"></i>
            </button>

            <button
              type="button"
              aria-label="Minimize chat"
              title="Minimize chat"
              onClick={() => setIsMinimized((current) => !current)}
            >
              <i className="bi bi-dash-lg"></i>
            </button>

            <button
              type="button"
              aria-label="Close chat"
              title="Close chat"
              onClick={() => setIsOpen(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </header>
        <div className="cw-chat-messages" role="log" aria-live="polite">
          {messages.map((item, index) => (
            <div
              key={`${item.sender}-${index}`}
              className={`cw-chat-message ${item.sender}`}
            >
              <div className="cw-chat-bubble">{item.text}</div>
              <time className="cw-chat-time">{item.time}</time>
            </div>
          ))}
        </div>
        <div className="cw-chat-suggestions" aria-label="Suggested questions">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessage(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
        [6/16/2026 11:37 PM] Obsi:{" "}
        <form className="cw-chat-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="cw-chat-input">
            Ask CityWide support
          </label>

          <textarea
            id="cw-chat-input"
            rows="1"
            placeholder="Ask about CityWide services..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          ></textarea>

          <button type="submit" aria-label="Send message">
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </section>
  );
}
