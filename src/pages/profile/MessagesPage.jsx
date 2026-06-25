import { Link, useSearchParams } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getConversationById,
  getConversations,
} from "../../services/messageService.js";
import { formatDailyPrice } from "../../utils/currency.js";

export default function MessagesPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("conversation");
  const conversations = getConversations(activeUser?.id);
  const activeConversation = conversationId
    ? getConversationById(conversationId)
    : conversations[0];

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

      {!conversations.length ? (
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
                  src={conversation.listing.image}
                  alt={conversation.listing.title}
                />
                <div>
                  <strong>{conversation.subject}</strong>
                  <span>{conversation.context}</span>
                </div>
              </Link>
            ))}
          </aside>

          <article className="message-chat premium-glass-card">
            <div className="message-chat-header">
              <div>
                <span className="section-label">LISTING ATTACHED</span>
                <h2>{activeConversation.subject}</h2>
              </div>
              <Link
                to={`/items/${activeConversation.itemId}`}
                className="btn btn-outline-danger"
              >
                View Listing
              </Link>
            </div>

            <div className="message-listing-context">
              <img
                src={activeConversation.listing.image}
                alt={activeConversation.listing.title}
              />
              <div>
                <strong>{activeConversation.listing.title}</strong>
                <span>{activeConversation.listing.location}</span>
                <span>
                  {activeConversation.listing.price ||
                    formatDailyPrice(
                      activeConversation.listing.pricePerDay || 0,
                    )}
                </span>
              </div>
            </div>

            <div className="message-bubble-list">
              {activeConversation.messages.map((message) => (
                <div className="message-bubble" key={message.id}>
                  <strong>{message.senderName}</strong>
                  <p>{message.body}</p>
                  <span>{new Date(message.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <form
              className="message-compose"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Continue the conversation..."
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
