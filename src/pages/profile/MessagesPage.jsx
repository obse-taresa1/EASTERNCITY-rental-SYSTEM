import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getConversationById,
  getConversations,
  sendMessage,
} from "../../services/messageApiService.js";
import { formatDailyPrice } from "../../utils/currency.js";

export default function MessagesPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const conversationId = searchParams.get("conversation");
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadConversations({ initial = false } = {}) {
      if (initial) setLoading(true);
      try {
        const data = await getConversations();
        if (!active) return;
        setConversations(data);

        if (!conversationId && data[0]?.id) {
          navigate(`/messages?conversation=${data[0].id}`, { replace: true });
        }
      } catch (err) {
        if (active) setError(err.message || "Could not load messages.");
      } finally {
        if (active && initial) setLoading(false);
      }
    }

    loadConversations({ initial: true });

    const interval = window.setInterval(() => loadConversations(), 5000);
    const handleRefresh = () => loadConversations();
    window.addEventListener("easterncity:messages-updated", handleRefresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("easterncity:messages-updated", handleRefresh);
    };
  }, [activeUser?.id, conversationId, navigate]);

  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null);
      return;
    }
    let active = true;

    async function loadConversation({ showLoading = false } = {}) {
      if (showLoading) setConversationLoading(true);
      try {
        const conversation = await getConversationById(conversationId);
        if (!active) return;
        setActiveConversation(conversation);
        setConversations((items) =>
          items.map((item) =>
            item.id === conversation?.id
              ? { ...item, unreadCount: 0, lastMessage: conversation.lastMessage }
              : item,
          ),
        );
      } catch (err) {
        if (active) setError(err.message || "Could not load this conversation.");
      } finally {
        if (active && showLoading) setConversationLoading(false);
      }
    }

    loadConversation({ showLoading: true });
    const interval = window.setInterval(() => loadConversation(), 3000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [conversationId]);

  const currentConversation = useMemo(() => {
    if (activeConversation?.id === conversationId) {
      return activeConversation;
    }

    return (
      conversations.find((conversation) => conversation.id === conversationId) ||
      conversations[0] ||
      null
    );
  }, [activeConversation, conversationId, conversations]);

  async function handleSendMessage(event) {
    event.preventDefault();
    if (!currentConversation || !draft.trim()) return;

    const body = draft.trim();
    setDraft("");
    setSending(true);
    setError("");
    try {
      const message = await sendMessage({
        conversationId: currentConversation.id,
        body,
      });
      setActiveConversation((conversation) =>
        conversation?.id === currentConversation.id
          ? {
              ...conversation,
              messages: [...(conversation.messages || []), message],
              lastMessage: message,
            }
          : {
              ...currentConversation,
              messages: [...(currentConversation.messages || []), message],
              lastMessage: message,
              unreadCount: 0,
            },
      );
      setConversations((items) =>
        items.map((conversation) =>
          conversation.id === currentConversation.id
            ? {
                ...conversation,
                lastMessage: message,
                unreadCount: 0,
              }
            : conversation,
        ),
      );
      window.dispatchEvent(new Event("easterncity:messages-updated"));
    } catch (err) {
      setDraft(body);
      setError(err.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [currentConversation?.messages?.length, currentConversation?.id]);

  function getOtherParticipant(conversation) {
    if (!conversation || !activeUser) return null;
    return conversation.participantOneId === activeUser.id
      ? conversation.participantTwo
      : conversation.participantOne;
  }

  function formatMessageTime(value) {
    if (!value) return "";
    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <main className="dashboard-content messages-workspace">
        Loading messages...
      </main>
    );
  }

  return (
    <main className="dashboard-content messages-workspace">
      <div className="dashboard-header">
        <div>
          <span className="section-label">MESSAGES</span>
          <h1>Rental Conversations</h1>
          <p className="owner-muted mb-0">
            Discuss availability, pickup, delivery, duration, pricing, and
            payment arrangements.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!conversations.length || !currentConversation ? (
        <EmptyState
          icon="bi-chat-dots"
          title="No messages"
          description="Contact an owner from a listing page to start a rental conversation."
          action={
            <Link to="/items" className="btn btn-accent-custom btn-shine">
              Browse Listings
            </Link>
          }
        />
      ) : (
        <section className="messages-layout">
          <aside className="messages-list premium-glass-card">
            {conversations.map((conversation) => (
              <Link
                to={`/messages?conversation=${conversation.id}`}
                className={`message-thread ${conversationId === conversation.id ? "is-active" : ""}`}
                key={conversation.id}
              >
                <div className="message-thread-avatar">
                  {getOtherParticipant(conversation)?.profileImage ? (
                    <img
                      src={getOtherParticipant(conversation).profileImage}
                      alt={getOtherParticipant(conversation)?.name || "User"}
                    />
                  ) : (
                    <span>
                      {(getOtherParticipant(conversation)?.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="message-thread-copy">
                  <strong>
                    {getOtherParticipant(conversation)?.name || "Owner"}
                  </strong>
                  <span>
                    {conversation.listing?.title || "Rental conversation"}
                  </span>
                  <small>
                    {conversation.lastMessage?.body || "No messages yet."}
                  </small>
                </div>
                <div className="message-thread-meta">
                  <time>{formatMessageTime(conversation.lastMessage?.createdAt)}</time>
                  {conversation.unreadCount > 0 && (
                    <span className="message-unread-count">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </aside>

          <article className="message-chat premium-glass-card">
            <div className="message-chat-header">
              <div>
                <span className="section-label">CHAT WITH OWNER</span>
                <h2>
                  {getOtherParticipant(currentConversation)?.name ||
                    "Rental conversation"}
                </h2>
                <p className="owner-muted mb-0">
                  {currentConversation.listing?.title}
                </p>
              </div>
              <Link
                to={`/items/${currentConversation.listing?.id || currentConversation.itemId}`}
                className="btn btn-outline-danger"
              >
                View Listing
              </Link>
            </div>

            <div className="message-listing-context">
              <img
                src={currentConversation.listing?.image}
                alt={currentConversation.listing?.title}
              />
              <div>
                <strong>{currentConversation.listing?.title}</strong>
                <span>{currentConversation.listing?.location}</span>
                <span>
                  {currentConversation.listing?.price ||
                    formatDailyPrice(
                      currentConversation.listing?.pricePerDay || 0,
                    )}
                </span>
              </div>
            </div>

            <div className="message-bubble-list">
              {conversationLoading && (
                <div className="owner-muted">Loading conversation...</div>
              )}
              {(currentConversation.messages || []).map((message) => (
                <div
                  className={`message-bubble ${
                    message.senderId === activeUser?.id ? "sent" : "received"
                  }`}
                  key={message.id}
                >
                  <strong>
                    {message.sender?.name || message.senderName || "User"}
                  </strong>
                  <p>{message.body}</p>
                  <span>{formatMessageTime(message.createdAt)}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form className="message-compose" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="form-control"
                placeholder="Continue the conversation..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="btn btn-accent-custom btn-shine"
                disabled={sending || !draft.trim()}
                aria-label="Send message"
              >
                <i className="bi bi-send"></i>
              </button>
            </form>
          </article>
        </section>
      )}
    </main>
  );
}
