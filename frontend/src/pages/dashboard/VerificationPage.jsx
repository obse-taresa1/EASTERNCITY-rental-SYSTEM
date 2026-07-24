import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSefarByCity, sefarByCity } from "../../data/sefar.js";
import { refreshCurrentUser } from "../../services/authService.js";
import { submitVerificationRequest } from "../../services/verificationApiService.js";
import {
  getVerificationTone,
  isVerificationApproved,
  normalizeVerificationStatus,
} from "../../utils/verificationStatus.js";

const STATUS_CONFIG = {
  verified: {
    label: "Verified",
    cls: "verif-verified",
    icon: "bi-patch-check-fill",
    desc: "Your identity has been confirmed. You can rent and list items freely.",
  },
  "not-verified": {
    label: "Not Verified",
    cls: "verif-pending",
    icon: "bi-shield-exclamation",
    desc: "You have not submitted a National ID verification request yet.",
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
  const normalized = normalizeVerificationStatus(status);
  const tone = getVerificationTone(normalized);
  if (tone === "verified") return STATUS_CONFIG.verified;
  if (tone === "rejected") return STATUS_CONFIG.rejected;
  if (tone === "pending") return STATUS_CONFIG["pending verification"];
  return STATUS_CONFIG["not-verified"];
}

export default function VerificationPage() {
  const { currentUser, user, setCurrentUser } = useAuth();
  const activeUser = user || currentUser;
  const [form, setForm] = useState({
    city: activeUser?.city || "",
    sefer: activeUser?.sefer || "",
    address: activeUser?.address || "",
    nationalIdFront: null,
    nationalIdBack: null,
  });
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullUser = activeUser;
  const cities = Object.keys(sefarByCity);
  const seferOptions = useMemo(() => getSefarByCity(form.city), [form.city]);

  const verificationStatus = normalizeVerificationStatus(
    fullUser?.verificationStatus,
  );
  const statusCfg = getStatusConfig(verificationStatus);
  const hasSubmittedVerification =
    verificationStatus !== "Not Verified" &&
    Boolean(fullUser?.nationalIdFront || fullUser?.nationalIdBack);
  const submittedDate = hasSubmittedVerification && fullUser?.createdAt
    ? new Date(fullUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  function handleFileChange(fieldName, event) {
    const file = event.target.files?.[0] || null;
    setForm((current) => ({ ...current, [fieldName]: file }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");

    if (!form.city || !form.sefer) {
      setNotice("Please select your city and sefer before submitting.");
      return;
    }

    if (!form.nationalIdFront || !form.nationalIdBack) {
      setNotice("Please upload both the front and back side of your National ID.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitVerificationRequest(form);
      const refreshedUser = await refreshCurrentUser();
      if (refreshedUser) setCurrentUser(refreshedUser);
      setForm((current) => ({
        ...current,
        nationalIdFront: null,
        nationalIdBack: null,
      }));
      setNotice("Verification request submitted. Admin review is pending.");
    } catch (error) {
      setNotice(error.message || "Unable to submit verification request.");
    } finally {
      setIsSubmitting(false);
    }
  }

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

      {!isVerificationApproved(verificationStatus) && (
        <section className="ud-section">
          <h2 className="ud-section-title">
            <i className="bi bi-shield-plus" /> Submit Verification
          </h2>
          {notice && <div className="alert alert-info">{notice}</div>}
          <form className="ud-settings-form" onSubmit={handleSubmit}>
            <div className="ud-form-grid">
              <div className="ud-form-group">
                <label htmlFor="verification-city">City</label>
                <select
                  id="verification-city"
                  className="ud-input"
                  value={form.city}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      city: event.target.value,
                      sefer: "",
                    }))
                  }
                  required
                >
                  <option value="">Select city...</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ud-form-group">
                <label htmlFor="verification-sefer">Sefer</label>
                <select
                  id="verification-sefer"
                  className="ud-input"
                  value={form.sefer}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sefer: event.target.value,
                    }))
                  }
                  disabled={!form.city}
                  required
                >
                  <option value="">Select sefer...</option>
                  {seferOptions.map((sefer) => (
                    <option key={sefer} value={sefer}>
                      {sefer}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ud-form-group">
                <label htmlFor="verification-address">Address</label>
                <input
                  id="verification-address"
                  type="text"
                  className="ud-input"
                  value={form.address}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  placeholder="Street, building, or nearby landmark"
                />
              </div>
            </div>

            <div className="id-upload-grid mt-3">
              <label className="id-upload-card">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(event) =>
                    handleFileChange("nationalIdFront", event)
                  }
                />
                <i className="bi bi-id-card" />
                <strong>National ID Front</strong>
                <span>
                  {form.nationalIdFront
                    ? form.nationalIdFront.name
                    : "Upload front image"}
                </span>
              </label>
              <label className="id-upload-card">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(event) => handleFileChange("nationalIdBack", event)}
                />
                <i className="bi bi-id-card-fill" />
                <strong>National ID Back</strong>
                <span>
                  {form.nationalIdBack
                    ? form.nationalIdBack.name
                    : "Upload back image"}
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="ud-btn-red mt-3"
              disabled={isSubmitting}
            >
              <i className="bi bi-send" />
              {isSubmitting ? "Submitting..." : "Submit Verification"}
            </button>
          </form>
        </section>
      )}

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
            {fullUser?.nationalIdFront || fullUser?.nationalIdFrontUrl ? (
              <img
                src={fullUser.nationalIdFront || fullUser.nationalIdFrontUrl}
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
            {fullUser?.nationalIdBack || fullUser?.nationalIdBackUrl ? (
              <img
                src={fullUser.nationalIdBack || fullUser.nationalIdBackUrl}
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
