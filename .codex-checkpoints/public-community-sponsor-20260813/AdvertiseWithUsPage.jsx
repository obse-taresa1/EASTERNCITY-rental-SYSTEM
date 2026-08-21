import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { submitAdvertisingRequest, uploadAdvertisingPaymentReceipt } from "../../services/advertisingRequestApiService.js";
import usePageTitle from "../../hooks/usePageTitle.js";

const benefits = [
  { icon: "bi-people", title: "Reach ready-to-rent customers", text: "Put your brand in front of people actively looking for rentals in Eastern Ethiopia." },
  { icon: "bi-stars", title: "Flexible campaign options", text: "Choose a homepage banner, featured placement, or a campaign tailored to your goals." },
  { icon: "bi-graph-up-arrow", title: "Grow with confidence", text: "Work with our team to create a visible, relevant campaign for your business." },
];

export default function AdvertiseWithUsPage() {
  usePageTitle("Advertise With Us");
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [searchParams] = useSearchParams();
  const paymentReference = searchParams.get("payment") || "";
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptStatus, setReceiptStatus] = useState("");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setStatus("");
    setIsSubmitting(true);

    try {
      await submitAdvertisingRequest(Object.fromEntries(form.entries()), form.get("banner"));
      formElement.reset();
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
      await uploadAdvertisingPaymentReceipt(form.get("reference"), form.get("email"), paymentProof);
      formElement.reset();
      setReceiptStatus("Receipt uploaded successfully. Our team will verify it and update your campaign.");
    } catch (error) {
      setReceiptStatus(error.message || "We could not upload your receipt. Check your reference and email, then try again.");
    } finally {
      setIsUploadingReceipt(false);
    }
  }

  const paymentReceiptForm = (
    <section className="advertise-form-card advertise-payment-only-card" id="payment-receipt">
      <div>
        <span className="section-label">PAYMENT RECEIPT</span>
        <h1>Upload your payment receipt</h1>
        <p className="text-muted mb-0">Your advertising team has sent a payment request. Upload your Telebirr or CBE Birr receipt for review.</p>
      </div>
      {receiptStatus && <div className="advertise-form-status" role="status">{receiptStatus}</div>}
      <form onSubmit={handleReceiptUpload} className="advertise-receipt-form">
        <label>Campaign reference<input name="reference" defaultValue={paymentReference} readOnly required /></label>
        <label>Email used for the request<input type="email" name="email" defaultValue={activeUser?.email || ""} required /></label>
        <label>Telebirr / CBE Birr receipt<input type="file" name="paymentProof" accept="image/jpeg,image/png,image/webp,application/pdf" required /></label>
        <button className="btn advertise-submit" type="submit" disabled={isUploadingReceipt}>{isUploadingReceipt ? "Uploading receipt..." : <><i className="bi bi-receipt" /> Upload payment receipt</>}</button>
      </form>
    </section>
  );

  if (paymentReference) {
    return (
      <main className="advertise-page advertise-payment-page">
        <section className="container advertise-payment-only-wrap">
          {paymentReceiptForm}
        </section>
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
          <a href="tel:+251900000000"><i className="bi bi-telephone-fill" /><span><small>Call our advertising team</small>+251 90 000 0000</span></a>
          <a href="mailto:advertise@easterncities.com"><i className="bi bi-envelope-fill" /><span><small>Email us anytime</small>advertise@easterncities.com</span></a>
        </aside>

        <section className="advertise-form-card">
          <div><span className="section-label">CAMPAIGN ENQUIRY</span><h2>Ready to be seen?</h2><p className="text-muted mb-0">No account is required. Submit your request and our team will review it within 24 hours.</p></div>
          {status && <div className="advertise-form-status" role="status">{status}</div>}
          <form onSubmit={handleSubmit}>
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
              <div style={{ gridColumn: "1 / -1" }}>
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
                      if (ratio < 3.0 || ratio > 5.0) {
                        msg = `Note: Your image aspect ratio is ${ratio.toFixed(1)}:1. We recommend a 4:1 ratio (like 1600 × 400 px) for the best display. It will be cropped.`;
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
          </form>
        </section>
      </section>
    </main>
  );
}
