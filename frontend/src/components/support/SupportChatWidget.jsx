import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { streamAiChat } from "../../services/aiChatService.js";

const CHAT_HISTORY_KEY = "easterncities_ai_chat_history";

const chatCopy = {
  en: {
    greeting: "Hello. I am the EasternCities AI assistant. I can help with rentals, listings, verification, accounts, and using the platform.",
    placeholder: "Ask about EasternCities...",
    unavailable: "I am currently unable to answer. Please contact support@cityrent.com for assistance.",
    suggestions: ["How do I verify my account?", "How do I contact a listing owner?", "How do I create a listing?"],
  },
  am: {
    greeting: "ሰላም። የEasternCities AI ረዳት ነኝ። በኪራይ፣ ዝርዝሮች፣ ማረጋገጫ እና መለያ ጉዳዮች ልረዳዎ እችላለሁ።",
    placeholder: "ስለ EasternCities ይጠይቁ...",
    unavailable: "በአሁኑ ጊዜ መልስ መስጠት አልችልም። እባክዎ ለእርዳታ support@cityrent.com ያግኙ።",
    suggestions: ["መለያዬን እንዴት አረጋግጣለሁ?", "የዝርዝር ባለቤትን እንዴት አነጋግራለሁ?", "ዝርዝር እንዴት እፈጥራለሁ?"],
  },
  so: {
    greeting: "Salaan. Waxaan ahay kaaliyaha AI ee EasternCities. Waxaan kaa caawin karaa kirada, liisaska, xaqiijinta, iyo akoonnada.",
    placeholder: "Weydii EasternCities...",
    unavailable: "Hadda ma awoodo inaan ka jawaabo. Fadlan la xiriir support@cityrent.com wixii caawimaad ah.",
    suggestions: ["Sideen u xaqiijiyaa akoonkayga?", "Sideen ula xiriiraa milkiilaha liiska?", "Sideen u sameeyaa liis?"],
  },
  af: {
    greeting: "Akkam. Ani gargaaraa AI EasternCities dha. Waa'ee kiraa, tarreewwan, mirkaneessaafi herrega fayyadamaa siif gargaara.",
    placeholder: "Waa'ee EasternCities gaafadhu...",
    unavailable: "Yeroo ammaa deebisuu hin danda'u. Maaloo gargaarsaaf support@cityrent.com quunnami.",
    suggestions: ["Herrega koo akkamitti mirkaneessa?", "Abbaa tarree akkamitti quunnama?", "Tarree akkamitti uuma?"],
  },
};

function createMessage(sender, text) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    sender,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function loadSessionMessages(language) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(CHAT_HISTORY_KEY) || "[]");
    if (Array.isArray(stored) && stored.length) return stored;
  } catch {
    // The widget can start a fresh session when storage is unavailable.
  }

  return [createMessage("bot", chatCopy[language]?.greeting || chatCopy.en.greeting)];
}

export default function SupportChatWidget() {
  const { language, t } = useLanguage();
  const copy = chatCopy[language] || chatCopy.en;
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState(() => loadSessionMessages(language));

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch {
      // Session storage is optional; the in-memory conversation still works.
    }
  }, [messages]);

  useEffect(() => {
    setMessages((current) =>
      current.map((msg, index) => {
        if (index === 0 && msg.sender === "bot") {
          return { ...msg, text: copy.greeting };
        }
        return msg;
      })
    );
  }, [language, copy.greeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

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
        signal: controller.signal,
        onDelta: (textDelta) => {
          setMessages((current) =>
            current.map((item) =>
              item.id === assistantMessage.id ? { ...item, text: textDelta } : item,
            ),
          );
        },
      });
    } catch (error) {
      if (error.name === "AbortError") return;
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantMessage.id
            ? { ...item, text: copy.unavailable }
            : item,
        ),
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
      aria-label="EasternCities AI chat"
    >
      <button
        className="cw-support-launcher"
        type="button"
        aria-label="Open EasternCities AI chat"
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
            <h2>EasternCities AI</h2>
            <p><span></span>Online assistant</p>
          </div>

          <div className="cw-chat-actions">
            <button type="button" aria-label="Clear chat" title="Clear chat" onClick={clearChat}>
              <i className="bi bi-trash3"></i>
            </button>
            <button type="button" aria-label="Minimize chat" title="Minimize chat" onClick={() => setIsMinimized((current) => !current)}>
              <i className="bi bi-dash-lg"></i>
            </button>
            <button type="button" aria-label="Close chat" title="Close chat" onClick={() => setIsOpen(false)}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </header>

        <div className="cw-chat-messages" role="log" aria-live="polite">
          {messages.map((item) => (
            <div key={item.id} className={`cw-chat-message ${item.sender}`}>
              <div className="cw-chat-bubble">
                {item.text || (isLoading && item.sender === "bot" ? (
                  <span className="cw-chat-typing" aria-label="Assistant is typing"><span></span><span></span><span></span></span>
                ) : null)}
              </div>
              {item.text && <time className="cw-chat-time">{item.time}</time>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="cw-chat-suggestions" aria-label="Suggested questions">
          {copy.suggestions.map((suggestion) => (
            <button key={suggestion} type="button" disabled={isLoading} onClick={() => sendMessage(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>

        <form className="cw-chat-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="cw-chat-input">Ask EasternCities AI</label>
          <textarea
            id="cw-chat-input"
            rows="1"
            placeholder={copy.placeholder}
            value={message}
            disabled={isLoading}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage(message);
              }
            }}
          ></textarea>
          <button type="submit" disabled={isLoading || !message.trim()} aria-label="Send message">
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </section>
  );
}
