import { useState } from "react";
import { Link } from "react-router-dom";
import { createSupportTicket } from "../../services/supportTicketService.js";

const FAQS = [
  {
    q: "How do I list an item for rent?",
    a: "Go to Dashboard → Add New Listing. Fill in all details including item name, category, city, price, and upload images. Your listing will be live immediately.",
  },
  {
    q: "How does the booking process work?",
    a: "Browse items, request a booking, and select your dates. The owner accepts or rejects the request, and rental payment is arranged directly between you and the owner.",
  },
  {
    q: "How do I get verified?",
    a: "Verification is done during registration by uploading your National ID (front and back). You can check your verification status in the Verification Center.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Contact the owner through Messages to discuss cancellation. Currently, cancellations are handled case-by-case through direct communication.",
  },
  {
    q: "How do I contact an owner?",
    a: "On any listing's detail page, click 'Contact Owner'. A conversation will be created in your Messages section.",
  },
  {
    q: "What payment methods are accepted?",
    a: "Rental payments are not processed by EasternCity. Users agree on payment directly with each other. The platform only reviews payment screenshots for listing promotions.",
  },
  {
    q: "How do I leave a review?",
    a: "After a rental is marked as Completed, go to Reviews & Ratings in your dashboard and click 'Leave Review' next to the booking.",
  },
  {
    q: "I forgot my password. What do I do?",
    a: "Go to Settings → Password and update it there if you're logged in. If you can't log in, please contact support using the form below.",
  },
];

export default function HelpCenterPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    await createSupportTicket({
      subject: form.subject,
      message: form.message,
      priority: "MEDIUM",
    });
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  }

  return (
    <div className="ud-page">
      <div className="ud-page-header">
        <div>
          <span className="ud-label">SUPPORT</span>
          <h1 className="ud-page-title">Help Center</h1>
          <p className="ud-page-sub">
            Find answers and get support from the EasternCity team.
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="help-quick-links">
        {[
          { to: "/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
          {
            to: "/my-bookings",
            icon: "bi-calendar-check",
            label: "My Bookings",
          },
          { to: "/messages", icon: "bi-chat-dots", label: "Messages" },
          {
            to: "/verification",
            icon: "bi-shield-check",
            label: "Verification",
          },
          { to: "/contact", icon: "bi-envelope", label: "Contact Us" },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="help-quick-link ud-glass-card"
          >
            <i className={`bi ${link.icon}`} />
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="help-layout">
        {/* FAQ */}
        <section className="ud-section help-faq-section">
          <h2 className="ud-section-title">
            <i className="bi bi-question-circle" /> Frequently Asked Questions
          </h2>
          <div className="help-faq-list">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`help-faq-item ud-glass-card ${openFaq === i ? "help-faq-open" : ""}`}
              >
                <button
                  type="button"
                  className="help-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <i
                    className={`bi ${openFaq === i ? "bi-chevron-up" : "bi-chevron-down"}`}
                  />
                </button>
                {openFaq === i && <p className="help-faq-a">{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="ud-section help-contact-section">
          <h2 className="ud-section-title">
            <i className="bi bi-envelope" /> Contact Support
          </h2>
          <div className="ud-glass-card help-contact-card">
            {submitted ? (
              <div className="ud-alert ud-alert-success help-submitted">
                <i className="bi bi-check-circle-fill" />
                <div>
                  <strong>Message sent!</strong>
                  <p>Our team will get back to you within 24 hours.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="ud-settings-form">
                <div className="ud-form-grid">
                  <div className="ud-form-group">
                    <label htmlFor="help-name">Your Name</label>
                    <input
                      id="help-name"
                      type="text"
                      className="ud-input"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="ud-form-group">
                    <label htmlFor="help-email">Email Address</label>
                    <input
                      id="help-email"
                      type="email"
                      className="ud-input"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="ud-form-group">
                  <label htmlFor="help-subject">Subject</label>
                  <input
                    id="help-subject"
                    type="text"
                    className="ud-input"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="ud-form-group">
                  <label htmlFor="help-msg">Message</label>
                  <textarea
                    id="help-msg"
                    className="ud-input"
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    required
                  />
                </div>
                <button type="submit" className="ud-btn-red">
                  <i className="bi bi-send" /> Send Message
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

