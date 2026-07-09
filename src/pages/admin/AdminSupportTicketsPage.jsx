import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import {
  fetchSupportTickets,
  replyToSupportTicket,
  resolveSupportTicket,
} from "../../services/supportTicketService.js";

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [replyTicket, setReplyTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadTickets() {
    try {
      const data = await fetchSupportTickets();
      setTickets(data);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load support tickets.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyTicket) return;

    try {
      await replyToSupportTicket(replyTicket.id, replyText.trim());
      await loadTickets();
      setNotice(`Reply sent to ${replyTicket.name}.`);
      setError("");
      setReplyText("");
      setReplyTicket(null);
    } catch (err) {
      setError(err.message || "Could not send reply.");
    }
  };

  const handleClose = async (id) => {
    try {
      await resolveSupportTicket(id);
      await loadTickets();
      setNotice("Support ticket closed.");
      setError("");
    } catch (err) {
      setError(err.message || "Could not close support ticket.");
    }
  };

  const filtered = tickets.filter(t => {
    const status = String(t.status || "").toLowerCase();
    if (filter === "all") return true;
    if (filter === "open") return !["closed", "resolved"].includes(status);
    if (filter === "closed") return ["closed", "resolved"].includes(status);
    return t.type === filter;
  });

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Support Tickets</h1>
          <p className="text-muted mb-0">
            Address customer inquiries, account help tickets, and contact messages.
          </p>
        </div>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-table-container">
        <div className="d-flex gap-2 mb-4">
          {["all", "open", "closed", "User Request", "Contact Message"].map(opt => (
            <button
              key={opt}
              type="button"
              className={`btn btn-sm ${filter === opt ? "btn-accent-custom" : "btn-outline-secondary"}`}
              onClick={() => setFilter(opt)}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Type</th>
                <th>User</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="fw-bold">{t.id}</td>
                  <td>
                    <span className={`badge ${t.type === "User Request" ? "bg-primary-subtle text-primary" : "bg-info-subtle text-info"}`}>
                      {t.type}
                    </span>
                  </td>
                  <td>{t.name}</td>
                  <td>{t.subject}</td>
                  <td>{t.date}</td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setReplyTicket(t)}
                      >
                        Reply
                      </button>
                      {!["resolved", "closed"].includes(String(t.status || "").toLowerCase()) && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleClose(t.id)}
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    {isLoading ? "Loading support tickets..." : "No support tickets matching criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {replyTicket && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <form onSubmit={handleSendReply}>
                <div className="modal-header border-0">
                  <h5 className="modal-title">Reply to {replyTicket.name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setReplyTicket(null)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <strong>Subject:</strong> {replyTicket.subject}
                  </div>
                  <div className="mb-3">
                    <strong>User Message:</strong>
                    <p className="p-3 border rounded mt-1 bg-light text-dark">{replyTicket.message}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Your Response</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setReplyTicket(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-accent-custom">
                    Send Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
