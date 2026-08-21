import { useEffect, useState } from "react";
import { resolveAssetUrl } from "../../services/apiClient.js";
import { fetchAdvertisingRequests, updateAdvertisingRequest } from "../../services/advertisingRequestApiService.js";

const statuses = ["PENDING", "CONTACTED", "WAITING_PAYMENT", "PAID", "APPROVED", "REJECTED", "COMPLETED"];

export default function AdvertisingManagementPage({ scope = "admin" }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [paymentReplies, setPaymentReplies] = useState({});

  async function load() {
    try {
      setRequests(await fetchAdvertisingRequests(filter));
    } catch (requestError) {
      setError(requestError.message || "Unable to load advertising requests.");
    }
  }

  useEffect(() => { load(); }, [filter]);

  async function setStatus(request, status, values = {}) {
    setError("");
    setNotice("");
    try {
      await updateAdvertisingRequest(request.id, { status, ...values });
      setNotice(`${request.reference} updated to ${status.replaceAll("_", " ")}.`);
      load();
    } catch (updateError) {
      setError(updateError.message || "Unable to update the campaign request.");
    }
  }

  return (
    <main className="dashboard-content">
      <div className="banner-ads-heading">
        <div>
          <span className="section-label">{scope === "superadmin" ? "SUPER ADMIN" : "ADMIN"}</span>
          <h1>Advertising Management</h1>
          <p>Review external advertising requests, payment receipts, and campaign approvals.</p>
        </div>
        <div className="banner-ads-heading-icon"><i className="bi bi-megaphone-fill" /></div>
      </div>
      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <section className="admin-table-container p-3 p-md-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div><h2 className="h5 mb-1">Campaign Requests</h2><p className="text-muted mb-0 small">Move a request to Await payment, review its receipt, then mark it paid.</p></div>
          <select className="form-select" style={{ maxWidth: 220 }} value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
          </select>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead><tr><th>Reference</th><th>Company</th><th>Campaign</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="fw-bold">{request.reference}</td>
                  <td><div>{request.companyName}</div><small className="text-muted">{request.contactPerson} · {request.email}</small></td>
                  <td>{request.campaignType.replaceAll("_", " ")}</td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td><span className="badge text-bg-light border">{request.status.replaceAll("_", " ")}</span></td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <a className="btn btn-sm btn-outline-secondary" href={`mailto:${request.email}`}>Contact</a>
                      {request.paymentProofUrl && <a className="btn btn-sm btn-outline-info" href={resolveAssetUrl(request.paymentProofUrl)} target="_blank" rel="noreferrer">View receipt</a>}
                      {request.status === "PENDING" && <>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setStatus(request, "CONTACTED")}>Contacted</button>
                        <button className="btn btn-sm btn-success" onClick={() => setStatus(request, "APPROVED")}>Approve</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setStatus(request, "REJECTED")}>Reject</button>
                      </>}
                      {request.status === "CONTACTED" && <div className="w-100 mt-2"><textarea className="form-control form-control-sm mb-2" rows="2" value={paymentReplies[request.id] || ""} onChange={(event) => setPaymentReplies((current) => ({ ...current, [request.id]: event.target.value }))} placeholder="Write your reply, payment amount, and Telebirr/CBE Birr instructions..." /><button className="btn btn-sm btn-warning" onClick={() => { const adminNote = (paymentReplies[request.id] || "").trim(); if (!adminNote) { setError("Write a reply and payment instructions before sending the payment request."); return; } setStatus(request, "WAITING_PAYMENT", { adminNote }); }}>Send reply & request payment</button></div>}
                      {request.status === "WAITING_PAYMENT" && <button className="btn btn-sm btn-success" title={request.paymentProofUrl ? "Mark receipt as paid" : "Waiting for the advertiser to upload a receipt"} disabled={!request.paymentProofUrl} onClick={() => setStatus(request, "PAID")}>Mark paid</button>}
                      {request.status === "PAID" && <button className="btn btn-sm btn-success" onClick={() => setStatus(request, "APPROVED")}>Approve</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!requests.length && <tr><td colSpan="6" className="text-center text-muted py-5">No advertising campaign requests found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
