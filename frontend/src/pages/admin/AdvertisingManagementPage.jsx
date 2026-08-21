import { useEffect, useState } from "react";
import { resolveAssetUrl } from "../../services/apiClient.js";
import { fetchAdvertisingRequests, updateAdvertisingRequest } from "../../services/advertisingRequestApiService.js";
import BaseModal from "../../components/common/BaseModal";

const statuses = ["PENDING","CONTACTED","WAITING_PAYMENT","PAID","APPROVED","REJECTED","COMPLETED"];

function statusLabel(request) {
  if (request.status === "WAITING_PAYMENT" && request.paymentProofUrl) return "Receipt pending review";
  return request.status.replaceAll("_", " ");
}

export default function AdvertisingManagementPage({ scope = "admin" }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [paymentReplies, setPaymentReplies] = useState({});
  const [contactingRequestId, setContactingRequestId] = useState(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

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
      setNotice(`${request.reference} updated to ${status.replaceAll("_"," ")}.`);
      load();
      return true;
    } catch (updateError) {
      setError(updateError.message || "Unable to update the campaign request.");
      return false;
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
          <div>
            <h2 className="h5 mb-1">Campaign Requests</h2>
            <p className="text-muted mb-0 small">Review campaign details, reply with payment instructions, then approve the uploaded receipt to activate the banner.</p>
          </div>
          <select className="form-select" style={{maxWidth:220}} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status.replaceAll("_"," ")}</option>
            ))}
          </select>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Company</th>
                <th>Campaign</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td className="fw-bold">{request.reference}</td>
                  <td>
                    <div>{request.companyName}</div>
                    <small className="text-muted">{request.contactPerson} · {request.email}</small>
                  </td>
                  <td>{request.campaignType.replaceAll("_"," ")}</td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td><span className={`badge ${request.status === "APPROVED" ? "text-bg-success" : request.status === "REJECTED" ? "text-bg-danger" : request.status === "WAITING_PAYMENT" && request.paymentProofUrl ? "text-bg-warning" : "text-bg-light border"}`}>{statusLabel(request)}</span></td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setSelectedRequest(request)}>Review</button>
                      {(request.status === "PENDING" || request.status === "CONTACTED") && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setError("");
                            setContactingRequestId(currentId => currentId === request.id ? null : request.id);
                          }}
                        >
                          <i className="bi bi-envelope me-1" />
                          {contactingRequestId === request.id ? "Close reply" : "Contact"}
                        </button>
                      )}
                      {request.paymentProofUrl && (
                        <button type="button" className="btn btn-sm btn-outline-info" onClick={() => { setReceiptModalUrl(resolveAssetUrl(request.paymentProofUrl)); setShowReceiptModal(true); }}>View receipt</button>
                      )}
                      {(request.status === "PENDING" || request.status === "CONTACTED") && contactingRequestId === request.id && (
                        <>
                        <div className="w-100 mt-2">
                          <div className="small fw-semibold mb-2">Email reply to {request.contactPerson}</div>
                          <textarea className="form-control form-control-sm mb-2" rows="2" value={paymentReplies[request.id]||""} onChange={e => setPaymentReplies(prev => ({...prev, [request.id]: e.target.value}))} placeholder="Write your reply, payment amount, and Telebirr/CBE Birr instructions..." />
                          <button className="btn btn-sm btn-warning" onClick={async () => {
                            const adminNote = (paymentReplies[request.id]||"").trim();
                            if (!adminNote) { setError("Write a reply and payment instructions before sending the payment request."); return; }
                            if (await setStatus(request,"WAITING_PAYMENT",{adminNote})) setContactingRequestId(null);
                          }}>Send payment request email</button>
                          <button className="btn btn-sm btn-outline-danger ms-2" onClick={async () => {
                            if (await setStatus(request,"REJECTED", { adminNote: (paymentReplies[request.id] || "Campaign request was not approved.").trim() })) setContactingRequestId(null);
                          }}>Reject</button>
                        </div>
                        </>
                      )}
                      {request.status === "WAITING_PAYMENT" && (
                        request.paymentProofUrl ? <>
                          <button className="btn btn-sm btn-success" onClick={() => setStatus(request,"APPROVED", { adminNote: (paymentReplies[request.id] || request.adminNote || "Payment receipt approved. Your campaign is now scheduled.").trim() })}>Approve payment & activate</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setStatus(request,"REJECTED", { adminNote: (paymentReplies[request.id] || "Your payment receipt needs attention. Please contact the advertising team.").trim() })}>Reject payment</button>
                        </> : <span className="small text-muted">Waiting for receipt upload</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!requests.length && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-5">No advertising campaign requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRequest && (
        <BaseModal isOpen={Boolean(selectedRequest)} title={`Campaign review - ${selectedRequest.reference}`} onClose={() => setSelectedRequest(null)} className="advertising-review-modal">
          <div className="advertising-review-details">
            {selectedRequest.bannerUrl && <img className="advertising-review-banner" src={resolveAssetUrl(selectedRequest.bannerUrl)} alt={`${selectedRequest.companyName} campaign banner`} />}
            <div className="advertising-review-grid">
              {[
                ["Company", selectedRequest.companyName], ["Contact person", selectedRequest.contactPerson], ["Email", selectedRequest.email], ["Phone", selectedRequest.phone],
                ["Business category", selectedRequest.businessCategory], ["Campaign", selectedRequest.campaignType?.replaceAll("_", " ")], ["Website", selectedRequest.website || "Not supplied"], ["Social media", selectedRequest.socialMedia || "Not supplied"],
                ["Campaign goal", selectedRequest.campaignGoal || "Not supplied"], ["Schedule", `${selectedRequest.preferredStartDate ? new Date(selectedRequest.preferredStartDate).toLocaleDateString() : "Flexible"} - ${selectedRequest.preferredEndDate ? new Date(selectedRequest.preferredEndDate).toLocaleDateString() : "Flexible"}`],
                ["Campaign status", statusLabel(selectedRequest)], ["Payment status", selectedRequest.paymentProofUrl ? (selectedRequest.status === "APPROVED" ? "Approved" : "Receipt pending review") : "No receipt uploaded"],
              ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
            </div>
            <div className="advertising-review-message"><span>Campaign message</span><p>{selectedRequest.campaignMessage}</p></div>
            <div className="advertising-review-message"><span>Admin notes</span><p>{selectedRequest.adminNote || "No admin notes yet."}</p></div>
          </div>
        </BaseModal>
      )}

      {showReceiptModal && (
        <BaseModal isOpen={showReceiptModal} title="Payment Receipt" onClose={() => setShowReceiptModal(false)} className="advertising-receipt-modal">
          <div className="advertising-receipt-viewer">
            <img src={receiptModalUrl} alt="Uploaded payment receipt" />
          </div>
        </BaseModal>
      )}
    </main>
  );
}
