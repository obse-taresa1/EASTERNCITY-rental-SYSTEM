import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  const conversationId = searchParams.get("conversation");
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let active = true;

    async function loadConversations() {
      setLoading(true);
      try {
        const data = await getConversations();
        if (!active) return;
        const filtered = activeUser
          ? data.filter((conversation) =>
              [
                conversation.participantOneId,
                conversation.participantTwoId,
              ].includes(activeUser.id),
            )
          : [];
        setConversations(filtered);
        const selected = conversationId
          ? await getConversationById(conversationId)
          : filtered[0] || null;
        if (active) setActiveConversation(selected);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadConversations();

    const handleRefresh = () => loadConversations();
    window.addEventListener("easterncity:messages-updated", handleRefresh);
    return () => {
      active = false;
      window.removeEventListener("easterncity:messages-updated", handleRefresh);
    };
  }, [activeUser?.id, conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    let active = true;

    getConversationById(conversationId).then((conversation) => {
      if (active) setActiveConversation(conversation);
    });

    return () => {
      active = false;
    };
  }, [conversationId]);

  const currentConversation = useMemo(
    () => activeConversation || conversations[0] || null,
    [activeConversation, conversations],
  );

  async function handleSendMessage(event) {
    event.preventDefault();
    if (!currentConversation || !draft.trim()) return;

    await sendMessage({
      conversationId: currentConversation.id,
      body: draft.trim(),
    });
    setDraft("");
    window.dispatchEvent(new Event("easterncity:messages-updated"));
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
                className={`message-thread ${activeConversation?.id === conversation.id ? "is-active" : ""}`}
                key={conversation.id}
              >
                <img
                  src={conversation.listing?.image}
                  alt={conversation.listing?.title}
                />
                <div>
                  <strong>
                    {conversation.listing?.title ||
                      conversation.subject ||
                      "Conversation"}
                  </strong>
                  <span>
                    {conversation.listing?.location || conversation.context}
                  </span>
                </div>
              </Link>
            ))}
          </aside>

          <article className="message-chat premium-glass-card">
            <div className="message-chat-header">
              <div>
                <span className="section-label">LISTING ATTACHED</span>
                <h2>
                  {currentConversation.listing?.title ||
                    currentConversation.subject ||
                    "Conversation"}
                </h2>
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
              {(currentConversation.messages || []).map((message) => (
                <div className="message-bubble" key={message.id}>
                  <strong>
                    {message.sender?.name || message.senderName || "User"}
                  </strong>
                  <p>{message.body}</p>
                  <span>{new Date(message.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <form className="message-compose" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="form-control"
                placeholder="Continue the conversation..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button type="submit" className="btn btn-accent-custom btn-shine">
                <i className="bi bi-send"></i>
              </button>
            </form>
          </article>
        </section>
      )}
    </main>
  );
}
