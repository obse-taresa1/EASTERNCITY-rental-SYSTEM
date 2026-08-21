import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAdvertisingPaymentStatus, submitAdvertisingRequest, uploadAdvertisingPaymentReceipt } from "../../services/advertisingRequestApiService.js";
import usePageTitle from "../../hooks/usePageTitle.js";

const benefits = [
  { icon: "bi-people", title: "Reach ready-to-rent customers", text: "Put your brand in front of people actively looking for rentals in Eastern Ethiopia." },
  { icon: "bi-stars", title: "Homepage sponsorship", text: "Place your approved business banner in a dedicated sponsored carousel on the Eastern Cities home page." },
  { icon: "bi-graph-up-arrow", title: "Grow with confidence", text: "Work with our team to create a visible, relevant campaign for your business." },
];

export default function AdvertiseWithUsPage() {
  usePageTitle("Advertise With Us");
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [searchParams] = useSearchParams();
  const paymentReference = searchParams.get("payment") || "";
  const [status, setStatus] = useState("");
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptStatus, setReceiptStatus] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentEmail, setPaymentEmail] = useState(activeUser?.email || "");
  const [isLoadingPayment, setIsLoadingPayment] = useState(Boolean(paymentReference));
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  async function loadPaymentDetails(email = paymentEmail) {
    if (!paymentReference || !String(email).trim()) return;
    setIsLoadingPayment(true);
    setReceiptStatus("");
    try {
      setPaymentDetails(await getAdvertisingPaymentStatus(paymentReference, email));
    } catch (error) {
      setPaymentDetails(null);
      setReceiptStatus(error.message || "We could not load this campaign payment request.");
    } finally {
      setIsLoadingPayment(false);
    }
  }

  useEffect(() => {
    if (paymentReference && activeUser?.email) loadPaymentDetails(activeUser.email);
  }, [paymentReference, activeUser?.email]);

  useEffect(() => {
    if (submittedRequest) setStatus("");
  }, [submittedRequest]);

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus("");
    setIsSubmitting(true);

    try {
      const request = await submitAdvertisingRequest(Object.fromEntries(form.entries()), form.get("banner"));
      formElement.reset();
      setSubmittedRequest(request);
      setStatus("Thank you—our advertising team will contact you shortly.");
    } catch (error) {
      setStatus(error.message || "We could not send your request. Please call or email our team.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReceiptUpload(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const paymentProof = form.get("paymentProof");
    setReceiptStatus("");

    if (!(paymentProof instanceof File) || paymentProof.size === 0) {
      setReceiptStatus("Choose a Telebirr or CBE Birr receipt screenshot before uploading.");
      return;
    }

    setIsUploadingReceipt(true);
    try {
      const request = await uploadAdvertisingPaymentReceipt(form.get("reference"), form.get("email"), paymentProof);
      formElement.reset();
      setPaymentDetails((previous) => ({ ...previous, status: request.status, receiptUploaded: true, receiptReviewPending: true, canUploadReceipt: false }));
      setReceiptStatus("Receipt uploaded successfully. Our team will verify it and update your campaign.");
    } catch (error) {
      setReceiptStatus(error.message || "We could not upload your receipt. Check your reference and email, then try again.");
    } finally {
      setIsUploadingReceipt(false);
    }
  }

    const paymentReceiptForm = (
      <div className="card shadow-sm border-0 rounded-4 mx-auto p-4 p-md-5" style={{ maxWidth: "650px", backgroundColor: "#fff" }}>
        <div className="text-center mb-4 pb-2">
          <span className="text-uppercase fw-bold mb-2 d-block" style={{ color: "#dc3545", fontSize: "0.85rem", letterSpacing: "1px" }}>PAYMENT RECEIPT</span>
          <h1 className="h2 fw-bold mb-3" style={{ color: "#212529" }}>Upload your payment receipt</h1>
          <p className="text-muted mx-auto" style={{ fontSize: "0.95rem", maxWidth: "450px" }}>
            Enter your campaign reference and email, then upload your Telebirr or CBE Birr payment receipt for review.
          </p>
        </div>

        {receiptStatus && (
          <div className="alert alert-info rounded-3 mb-4" role="alert">
            {receiptStatus}
          </div>
        )}

        <form onSubmit={handleReceiptUpload}>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 text-start">
              <label className="form-label fw-bold small text-dark">Campaign Reference</label>
              <input type="text" name="reference" className="form-control form-control-lg border-secondary-subtle bg-light" defaultValue={paymentReference} placeholder="e.g. EC-AD-2026-326293" required />
            </div>
            <div className="col-12 col-md-6 text-start">
              <label className="form-label fw-bold small text-dark">Email used for the request</label>
              <input type="email" name="email" className="form-control form-control-lg border-secondary-subtle bg-light" defaultValue={paymentEmail} placeholder="e.g. rahmasala763@gmail.com" required />
            </div>
          </div>

          <div className="mb-4 text-start">
            <label className="form-label fw-bold small text-dark">Payment Receipt</label>
            <div 
              className="border border-2 border-dashed rounded-3 p-4 text-center bg-light" 
              style={{ cursor: "pointer", borderColor: "#dee2e6" }}
              onClick={() => document.getElementById('payment-proof-input').click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#dc3545"; e.currentTarget.style.backgroundColor = "#fff5f5"; }}
              onDragLeave={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#dee2e6"; e.currentTarget.style.backgroundColor = "#f8f9fa"; }}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "#dee2e6";
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                const files = e.dataTransfer.files;
                if (files.length) {
                  const fileInput = document.getElementById('payment-proof-input');
                  fileInput.files = files;
                  document.getElementById('selected-filename').textContent = files[0].name;
                }
              }}
            >
              <i className="bi bi-cloud-arrow-up display-5 mb-2 d-block" style={{ color: "#6c757d" }}></i>
              <span className="fw-bold d-block mb-1 text-dark">Choose File</span>
              <span className="small text-muted">Upload your Telebirr or CBE Birr receipt</span>
              <div className="mt-2 fw-medium" id="selected-filename" style={{ color: "#dc3545", fontSize: "0.9rem", wordBreak: "break-all" }}></div>
            </div>
            <input 
              id="payment-proof-input" 
              type="file" 
              name="paymentProof" 
              accept="image/jpeg,image/png,image/webp,application/pdf" 
              className="d-none"
              onChange={e => {
                const file = e.target.files[0];
                document.getElementById('selected-filename').textContent = file ? file.name : '';
              }} 
            />
          </div>

          <button type="submit" className="btn w-100 py-3 fw-bold text-white mb-3" style={{ backgroundColor: "#dc3545", borderRadius: "8px", fontSize: "1.05rem", border: "none" }} disabled={isUploadingReceipt}>
            {isUploadingReceipt ? "Uploading receipt..." : "Submit Payment Receipt"}
          </button>
          
          <p className="text-center text-muted small px-md-3 mb-0" style={{ lineHeight: "1.5" }}>
            Your receipt will be reviewed by the Eastern Cities advertising team. Your advertisement will only be activated after payment approval.
          </p>
        </form>
      </div>
    );

  if (searchParams.has("payment")) {
    return (
      <main className="d-flex align-items-center justify-content-center bg-light" style={{ minHeight: "80vh", padding: "4rem 1rem" }}>
        <div className="container">
          {paymentReceiptForm}
        </div>
      </main>
    );
  }

  return (
    <main className="advertise-page">
      <section className="advertise-hero">
        <div className="container advertise-hero-grid">
          <div className="advertise-hero-copy">
            <span className="advertise-eyebrow"><i className="bi bi-badge-ad" /> Eastern Cities for Business</span>
            <h1>Advertise Your Business Across Eastern Ethiopia</h1>
            <p>Reach thousands of renters in Jigjiga, Dire Dawa and Harar.</p>
            <div className="advertise-hero-actions">
              <a className="btn advertise-primary-action" href="#advertise-enquiry"><i className="bi bi-megaphone" /> Start your campaign</a>
              <a className="advertise-phone-link" href="tel:+251900000000"><i className="bi bi-telephone-fill" /> +251 90 000 0000</a>
            </div>
          </div>
          <div className="advertise-hero-art" aria-hidden="true">
            <div className="advertise-orbit orbit-one" />
            <div className="advertise-orbit orbit-two" />
            <div className="advertise-art-card advertise-art-main"><i className="bi bi-bar-chart-line-fill" /><strong>More visibility</strong><span>for your business</span></div>
            <div className="advertise-art-card advertise-art-small"><i className="bi bi-cursor-fill" /><span>Connect</span></div>
          </div>
        </div>
      </section>

      <section className="advertise-benefits container">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="advertise-benefit-card">
            <span><i className={`bi ${benefit.icon}`} /></span>
            <h2>{benefit.title}</h2>
            <p>{benefit.text}</p>
          </article>
        ))}
      </section>

      <section className="container advertise-contact-grid" id="advertise-enquiry">
        <aside className="advertise-contact-card">
          <span className="section-label">LET'S WORK TOGETHER</span>
          <h2>Tell us about your next campaign.</h2>
          <p>Our team will help you choose the right placement and build an advertising plan that fits your business.</p>
          <ul className="advertise-contact-benefits">
            <li><i className="bi bi-check2-circle" /> Dedicated homepage visibility</li>
            <li><i className="bi bi-check2-circle" /> Flexible campaign scheduling</li>
            <li><i className="bi bi-check2-circle" /> Review and support from our team</li>
          </ul>
          <a href="tel:+251900000000"><i className="bi bi-telephone-fill" /><span><small>Call our advertising team</small>+251 90 000 0000</span></a>
          <a href="mailto:advertise@easterncities.com"><i className="bi bi-envelope-fill" /><span><small>Email us anytime</small>advertise@easterncities.com</span></a>
        </aside>

        <section className="advertise-form-card">
          <div><span className="section-label">CAMPAIGN ENQUIRY</span><h2>Ready to be seen?</h2><p className="text-muted mb-0">No account is required. Submit your request and our team will review it within 24 hours.</p></div>
          {status && <div className="advertise-form-status" role="status">{status}</div>}
          {submittedRequest ? (
            <div className="advertise-submission-success" role="status">
              <i className="bi bi-check2-circle" />
              <h2>Thank you! Your advertising request has been submitted.</h2>
              <p>Our advertising team will review your campaign and contact you shortly.</p>
              <div className="advertise-reference-box"><span>Campaign reference</span><strong>{submittedRequest.reference}</strong></div>
              <button type="button" className="btn advertise-submit" onClick={() => { setSubmittedRequest(null); setStatus(""); }}>Submit another campaign</button>
            </div>
          ) : <form onSubmit={handleSubmit}>
            <div className="advertise-form-grid">
              <label>Company name<input name="companyName" placeholder="Your business or organisation" required /></label>
              <label>Contact person<input name="contactPerson" defaultValue={activeUser?.name || ""} required /></label>
              <label>Email address<input type="email" name="email" defaultValue={activeUser?.email || ""} required /></label>
              <label>Phone number<input name="phone" placeholder="+251 90 000 0000" required /></label>
              <label>Business category<input name="businessCategory" placeholder="Retail, hospitality, services..." required /></label>
              <label>Website <input type="url" name="website" placeholder="https://your-business.com" /></label>
              <label>Social media <input name="socialMedia" placeholder="@yourbusiness" /></label>
              <label>Campaign goal<input name="campaignGoal" placeholder="Brand awareness, calls, visits..." /></label>
              <label>Preferred start date<input type="date" name="preferredStartDate" /></label>
              <label>Preferred end date<input type="date" name="preferredEndDate" /></label>
              <div className="advertise-banner-upload" style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
                  <span>Homepage banner image <span className="text-muted fw-normal">(Recommended: 1600 × 400 px / 4:1 ratio. JPG, PNG or WebP)</span></span>
                  <input type="file" name="banner" accept="image/jpeg,image/png,image/webp" required onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                      e.target.parentElement.nextElementSibling.textContent = "";
                      return;
                    }
                    const img = new Image();
                    img.onload = () => {
                      const ratio = img.width / img.height;
                      let msg = "";
                      if (ratio < 3.8 || ratio > 4.2) {
                        msg = `Note: Your image aspect ratio is ${ratio.toFixed(1)}:1. We recommend a 4:1 ratio (like 1600 × 400 px) for the best display. Your artwork will be preserved without cropping.`;
                      } else if (img.width < 1000) {
                        msg = `Note: Your image width (${img.width}px) is a bit small. We recommend at least 1600px wide for crisp display.`;
                      }
                      e.target.parentElement.nextElementSibling.textContent = msg;
                      URL.revokeObjectURL(img.src);
                    };
                    img.src = URL.createObjectURL(file);
                  }} />
                </label>
                <div className="text-warning small mt-1 fw-bold" style={{ minHeight: "1.2rem" }}></div>
              </div>
              <label className="advertise-message-field">Campaign message<textarea name="campaignMessage" rows="4" placeholder="Tell us what you would like to promote and how we can help." required /></label>
              <label className="advertise-terms-field"><input type="checkbox" name="termsAccepted" value="true" required /><span>I agree that Eastern Cities may contact me about this advertising request.</span></label>
            </div>
            <button className="btn advertise-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending request..." : <><i className="bi bi-send-fill" /> Send campaign request</>}</button>
          </form>}
        </section>
      </section>
    </main>
  );
}
