import { useEffect, useMemo, useState } from "react";
import {
  getContactMessages,
  replyToContactMessage,
  resolveContactMessage,
} from "../../services/contactMessageService.js";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState(() => getContactMessages());
  const [selectedId, setSelectedId] = useState(() => messages[0]?.id || "");
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refreshMessages = () => setMessages(getContactMessages());
    window.addEventListener("easterncity:contact-messages-updated", refreshMessages);
    return () => {
      window.removeEventListener("easterncity:contact-messages-updated", refreshMessages);
    };
  }, []);

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedId) || messages[0] || null,
    [messages, selectedId],
  );

  useEffect(() => {
    if (selectedMessage?.id && selectedMessage.id !== selectedId) {
      setSelectedId(selectedMessage.id);
    }
  }, [selectedId, selectedMessage]);

  function handleSelect(message) {
    setSelectedId(message.id);
    setReply(message.adminReply || "");
    setNotice("");
  }

  function handleReply(event) {
    event.preventDefault();
    if (!selectedMessage || !reply.trim()) return;

    replyToContactMessage(selectedMessage.id, reply.trim());
    setNotice("Reply sent to the user's notifications.");
  }

  function handleResolve() {
    if (!selectedMessage) return;
    resolveContactMessage(selectedMessage.id);
    setNotice("Contact message marked as resolved.");
  }

  return (
    <main className="dashboard-content contact-messages-page">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Contact Messages</h1>
        </div>
      </div>

      {notice && <div className="alert alert-info">{notice}</div>}

      <div className="row g-4">
        <div className="col-lg-7">
          <section className="admin-table-container">
            <div className="table-responsive">
              <table className="table align-middle dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td>
                        <strong>{message.name}</strong>
                        <div className="small text-muted">{message.email}</div>
                      </td>
                      <td>{message.subject}</td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger">
                          {message.status}
                        </span>
                      </td>
                      <td>{formatDate(message.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleSelect(message)}
                          type="button"
                        >
                          Read
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!messages.length && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        No contact messages submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="col-lg-5">
          <section className="admin-table-container contact-message-detail">
            {selectedMessage ? (
              <>
                <div className="d-flex justify-content-between gap-3 mb-3">
                  <div>
                    <h2 className="h5 mb-1">{selectedMessage.subject}</h2>
                    <p className="small text-muted mb-0">
                      {selectedMessage.name} | {selectedMessage.email}
                    </p>
                  </div>
                  <span className="badge bg-danger-subtle text-danger align-self-start">
                    {selectedMessage.status}
                  </span>
                </div>

                <p className="contact-message-body">{selectedMessage.message}</p>
                <p className="small text-muted">Submitted: {formatDate(selectedMessage.createdAt)}</p>

                {selectedMessage.adminReply && (
                  <div className="alert alert-secondary">
                    <strong>Previous reply:</strong>
                    <p className="mb-0 mt-2">{selectedMessage.adminReply}</p>
                    <small>{formatDate(selectedMessage.repliedAt)}</small>
                  </div>
                )}

                <form onSubmit={handleReply}>
                  <label className="form-label" htmlFor="admin-contact-reply">
                    Admin Reply
                  </label>
                  <textarea
                    id="admin-contact-reply"
                    className="form-control mb-3"
                    rows="5"
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    required
                  />
                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-primary-custom" type="submit">
                      Send Reply
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={handleResolve}
                    >
                      Mark Resolved
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <p className="text-muted mb-0">Select a contact message to read details.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}