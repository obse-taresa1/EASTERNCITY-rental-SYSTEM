import { useState } from "react";
import { promotionPackages } from "../../data/promotions.js";
import {
  fetchOwnerListings,
  requestPromotion,
} from "../../services/promotionService.js";
import { useAuth } from "../../context/AuthContext.jsx";

// Fee per package (ETB)
const packageFees = { 1: 500, 2: 1000, 3: 2000 };

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PromoteListingsPage() {
  const { currentUser } = useAuth();
  const ownerId = currentUser?.id || "user";

  const [listings] = useState(() => fetchOwnerListings(ownerId));
  const [selectedListing, setSelectedListing] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Telebirr");
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { success, message }

  const currentPkg = promotionPackages.find((p) => p.id === Number(selectedPackage));
  const fee = currentPkg ? (packageFees[currentPkg.id] ?? 500) : null;

  async function handleScreenshot(e) {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setScreenshot({ name: file.name, preview: dataUrl });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedListing || !selectedPackage) return;
    if (!screenshot) {
      setResult({ success: false, message: "Please upload a payment screenshot." });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const listing = listings.find((item) => item.id === selectedListing);
      await requestPromotion(selectedListing, Number(selectedPackage), screenshot, {
        listingTitle: listing?.title,
        ownerId,
        userId: ownerId,
        userName: currentUser?.businessName || currentUser?.name || "User",
        ownerName: currentUser?.businessName || currentUser?.name || listing?.ownerName,
        packageName: currentPkg?.name,
        promotionType: currentPkg?.name,
        durationDays: currentPkg?.days,
        amount: fee,
        paymentMethod,
      });
      setResult({ success: true, message: "Promotion request submitted. Status: Pending." });
      setSelectedListing("");
      setSelectedPackage("");
      setScreenshot(null);
    } catch {
      setResult({ success: false, message: "Failed to submit promotion request." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="dashboard-content">
      <div className="mb-4">
        <span className="section-label">ADMIN</span>
        <h1 className="h3 mb-1">Promote Listings</h1>
        <p className="text-muted mb-0">
          Request featured placement for your listings to increase visibility.
        </p>
      </div>

      {result && (
        <div className={`alert ${result.success ? "alert-success" : "alert-danger"}`}>
          {result.message}
        </div>
      )}

      <div className="card" style={{ background: "var(--card-bg, #fff)" }}>
        <div className="card-body">
          <h5 className="card-title mb-3">New Promotion Request</h5>

          <form onSubmit={handleSubmit}>
            {/* ── Listing Selection ───────────────────────────────────── */}
            <div className="mb-3">
              <label className="form-label">Select Listing</label>
              <select
                className="form-select"
                value={selectedListing}
                onChange={(e) => setSelectedListing(e.target.value)}
                required
              >
                <option value="">-- Choose a listing --</option>
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Package Selection ───────────────────────────────────── */}
            <div className="mb-3">
              <label className="form-label">Select Promotion Package</label>
              <select
                className="form-select"
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                required
              >
                <option value="">-- Choose a package --</option>
                {promotionPackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} — {pkg.days} days
                  </option>
                ))}
              </select>
            </div>

            {/* ── Fee Summary ─────────────────────────────────────────── */}
            {currentPkg && fee !== null && (
              <div className="bg-light p-3 rounded mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Promotion Type</span>
                  <span className="fw-bold">{currentPkg.name}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Duration</span>
                  <span>{currentPkg.days} days</span>
                </div>
                <div
                  className="d-flex justify-content-between fw-bold"
                  style={{ borderTop: "1px solid #dee2e6", paddingTop: "0.5rem" }}
                >
                  <span>Amount</span>
                  <span style={{ color: "var(--primary-color)" }}>{fee} ETB</span>
                </div>
              </div>
            )}

            {/* ── Payment Method ──────────────────────────────────────── */}
            {currentPkg && (
              <div className="mb-3">
                <label className="form-label fw-bold">Payment Method</label>
                <div className="d-flex gap-3">
                  {["Telebirr", "CBE Birr", "Bank Transfer"].map((method) => (
                    <label key={method} className="d-flex align-items-center gap-2">
                      <input
                        type="radio"
                        name="promoPaymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── Screenshot Upload ───────────────────────────────────── */}
            {currentPkg && (
              <div className="mb-3">
                <label className="form-label fw-bold">Upload Payment Screenshot</label>
                <label className="btn btn-outline-danger d-block">
                  <i className="bi bi-upload me-2" />
                  {screenshot ? screenshot.name : "Choose Screenshot (JPG, PNG)"}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    hidden
                    onChange={handleScreenshot}
                  />
                </label>
                {screenshot && (
                  <img
                    src={screenshot.preview}
                    alt="Payment proof"
                    style={{
                      maxHeight: "140px",
                      marginTop: "0.5rem",
                      borderRadius: "8px",
                      border: "1px solid #dee2e6",
                    }}
                  />
                )}
              </div>
            )}

            {currentPkg && (
              <div className="alert alert-info mb-3">
                <i className="bi bi-info-circle me-2" />
                After submitting, your promotion request will be reviewed. Status will show as{" "}
                <strong>Pending Review</strong> until approved by an admin.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-accent-custom"
              disabled={submitting || !selectedListing || !selectedPackage}
            >
              {submitting ? "Submitting…" : "Submit Promotion Request"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

