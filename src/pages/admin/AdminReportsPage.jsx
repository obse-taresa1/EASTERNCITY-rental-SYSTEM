import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { fetchContactMessages } from "../../services/contactMessageService.js";
import { fetchSupportTickets } from "../../services/supportTicketService.js";

function isReportLike(record) {
  const text = `${record.subject || ""} ${record.message || ""}`.toLowerCase();
  return (
    text.includes("report") ||
    text.includes("complaint") ||
    text.includes("abuse") ||
    text.includes("dispute")
  );
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [viewingDetails, setViewingDetails] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchContactMessages(), fetchSupportTickets()]).then(
      ([messages, tickets]) => {
        if (!active) return;
        const contactReports = (messages || [])
          .filter(isReportLike)
          .map((message) => ({
            id: `contact-${message.id}`,
            reporter: message.name || message.email,
            type: "Contact Report",
            subject: message.subject,
            details: message.message,
            status: String(message.status || "OPEN").toLowerCase(),
          }));
        const ticketReports = (tickets || [])
          .filter(isReportLike)
          .map((ticket) => ({
            id: `ticket-${ticket.id}`,
            reporter:
              ticket.name || ticket.email || ticket.userName || ticket.userId,
            type: "Support Ticket",
            subject: ticket.subject,
            details: ticket.message,
            status: String(ticket.status || "OPEN").toLowerCase(),
          }));
        setReports([...contactReports, ...ticketReports]);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const filtered = reports.filter((report) => {
    if (filter === "all") return true;
    if (filter === "pending")
      return ["open", "pending"].includes(report.status);
    if (filter === "resolved")
      return ["resolved", "closed"].includes(report.status);
    return report.status === filter;
  });

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Reports & Complaints</h1>
          <p className="text-muted mb-0">
            Handle platform dispute reviews, report tickets, and user
            complaints.
          </p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="d-flex gap-2 mb-4">
          {["all", "pending", "resolved"].map((opt) => (
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
                <th>Type</th>
                <th>Reporter</th>
                <th>Subject/Target</th>
                <th>Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <tr key={report.id}>
                  <td>
                    <span className="badge bg-danger-subtle text-danger">
                      {report.type}
                    </span>
                  </td>
                  <td>{report.reporter || "-"}</td>
                  <td className="fw-bold">{report.subject}</td>
                  <td>
                    <div
                      className="text-truncate"
                      style={{ maxWidth: "250px" }}
                    >
                      {report.details}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={report.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info"
                      onClick={() => setViewingDetails(report)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No reports found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingDetails && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{ background: "var(--card-bg)" }}
            >
              <div className="modal-header border-0">
                <h5 className="modal-title">Dispute Report Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewingDetails(null)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Report Type:</strong>{" "}
                  <span className="text-danger">{viewingDetails.type}</span>
                </div>
                <div className="mb-3">
                  <strong>Reporter:</strong> {viewingDetails.reporter || "-"}
                </div>
                <div className="mb-3">
                  <strong>Subject/Target:</strong>{" "}
                  <span className="fw-bold">{viewingDetails.subject}</span>
                </div>
                <div className="mb-3">
                  <strong>Complaint Details:</strong>
                  <p className="p-3 border rounded mt-1 bg-light text-dark">
                    {viewingDetails.details}
                  </p>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewingDetails(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
