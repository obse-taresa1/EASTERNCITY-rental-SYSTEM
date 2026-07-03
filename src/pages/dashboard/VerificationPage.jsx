import { useAuth } from "../../context/AuthContext.jsx";

const STATUS_CONFIG = {
  verified: {
    label: "Verified",
    cls: "verif-verified",
    icon: "bi-patch-check-fill",
    desc: "Your identity has been confirmed. You can rent and list items freely.",
  },
  "pending verification": {
    label: "Pending Review",
    cls: "verif-pending",
    icon: "bi-hourglass-split",
    desc: "Your National ID has been submitted and is under review. This usually takes 1–3 business days.",
  },
  rejected: {
    label: "Rejected",
    cls: "verif-rejected",
    icon: "bi-x-circle-fill",
    desc: "Your ID was not accepted. Please re-register with a valid National ID.",
  },
};

function getStatusConfig(status) {
  const key = String(status || "").toLowerCase();
  return STATUS_CONFIG[key] || STATUS_CONFIG["pending verification"];
}

export default function VerificationPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;

  const fullUser = activeUser;

  const statusCfg = getStatusConfig(fullUser?.verificationStatus);
  const submittedDate = fullUser?.createdAt
    ? new Date(fullUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="ud-page">
      <div className="ud-page-header">
        <div>
          <span className="ud-label">IDENTITY</span>
          <h1 className="ud-page-title">Verification Center</h1>
          <p className="ud-page-sub">
            Your National ID verification status and submitted documents.
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div className={`verif-status-card ud-glass-card ${statusCfg.cls}`}>
        <div className="verif-status-icon">
          <i className={`bi ${statusCfg.icon}`} />
        </div>
        <div className="verif-status-body">
          <h2 className="verif-status-title">{statusCfg.label}</h2>
          <p className="verif-status-desc">{statusCfg.desc}</p>
          <div className="verif-meta-row">
            <span>
              <i className="bi bi-person" /> {fullUser?.name}
            </span>
            <span>
              <i className="bi bi-envelope" /> {fullUser?.email}
            </span>
            <span>
              <i className="bi bi-calendar3" /> Submitted: {submittedDate}
            </span>
          </div>
        </div>
      </div>

      {/* ID Documents */}
      <section className="ud-section">
        <h2 className="ud-section-title">
          <i className="bi bi-card-image" /> Submitted Documents
        </h2>
        <div className="verif-docs-grid">
          <div className="verif-doc-card ud-glass-card">
            <div className="verif-doc-header">
              <i className="bi bi-id-card" />
              <strong>National ID — Front</strong>
            </div>
            {fullUser?.nationalIdFront ? (
              <img
                src={fullUser.nationalIdFront}
                alt="National ID Front"
                className="verif-doc-img"
              />
            ) : (
              <div className="verif-doc-placeholder">
                <i className="bi bi-image" />
                <span>No image submitted</span>
              </div>
            )}
          </div>

          <div className="verif-doc-card ud-glass-card">
            <div className="verif-doc-header">
              <i className="bi bi-id-card-fill" />
              <strong>National ID — Back</strong>
            </div>
            {fullUser?.nationalIdBack ? (
              <img
                src={fullUser.nationalIdBack}
                alt="National ID Back"
                className="verif-doc-img"
              />
            ) : (
              <div className="verif-doc-placeholder">
                <i className="bi bi-image" />
                <span>No image submitted</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <div className="verif-info-banner">
        <i className="bi bi-info-circle-fill" />
        <div>
          <strong>Why do we verify?</strong>
          <p>
            Verification ensures a safe, trusted rental community. Verified
            users can list items, book rentals, and enjoy priority support. All
            ID documents are stored securely and only reviewed by authorized
            staff.
          </p>
        </div>
      </div>
    </div>
  );
}
