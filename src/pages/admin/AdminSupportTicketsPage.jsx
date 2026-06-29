import { useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const initialTickets = [
  { id: "ST-8092", name: "Almaz Belay", type: "User Request", subject: "Refund on promotion", date: "2026-06-25", status: "open", message: "I uploaded the wrong receipt screenshot for the VIP promotion. Can I get a refund or switch listings?" },
  { id: "ST-8093", name: "Yonas Kassa", type: "Contact Message", subject: "Partnership Inquiry", date: "2026-06-24", status: "open", message: "Hi, we are a tools supply warehouse and want to discuss listing bulk assets." },
  { id: "ST-8094", name: "Fatuma Mohammed", type: "User Request", subject: "Cannot upload ID", date: "2026-06-23", status: "closed", message: "The verification screen throws errors when uploading my national ID scan." },
];

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState(initialTickets);
  const [filter, setFilter] = useState("all");
  const [replyTicket, setReplyTicket] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    alert(`Reply sent to ${replyTicket.name}: "${replyText}"`);
    setReplyText("");
    setReplyTicket(null);
  };

  const handleClose = (id) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: "closed" } : t))
    );
  };

  const filtered = tickets.filter(t => {
    if (filter === "all") return true;
    if (filter === "open") return t.status === "open";
    if (filter === "closed") return t.status === "closed";
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
                      {t.status === "open" && (
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
                    No support tickets matching criteria.
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
