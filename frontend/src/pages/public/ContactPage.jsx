import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { createContactMessage } from "../../services/contactMessageService.js";

export default function ContactPage() {
  const location = useLocation();
  const [message, setMessage] = useState("");
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const { t } = useLanguage();
  const subject = location.state?.subject || "";

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await createContactMessage({
        userId: activeUser?.id || "",
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        subject: String(formData.get("subject") || "").trim(),
        message: String(formData.get("message") || "").trim(),
      });

      setMessage(t("messageSent") || "Your message was sent successfully.");
      form?.reset?.();
    } catch (error) {
      setMessage(error.message || "Could not send your message.");
    }
  }

  return (
    <main className="container page-header pb-5 legal-support-page">
      <div className="row g-4">
        <div className="col-lg-5">
          <section className="card card-custom p-4 h-100">
            <span className="section-label">{t("contactEyebrow")}</span>
            <h1 className="h3 mb-3">{t("contactUs")}</h1>
            <p className="text-muted">
              {t("contactLead")}
            </p>

            <p className="mb-2">
              <i className="bi bi-envelope"></i> support@cityrent.com
            </p>
            <p className="mb-0">
              <i className="bi bi-geo-alt"></i> {t("contactLocation")}
            </p>
          </section>
        </div>

        <div className="col-lg-7">
          <section className="card card-custom p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="contact-name">
                  {t("fullName")}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  className="form-control"
                  defaultValue={activeUser?.name || ""}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="contact-email">
                  {t("email")}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className="form-control"
                  defaultValue={activeUser?.email || ""}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="contact-subject">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  className="form-control"
                  defaultValue={subject}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="contact-message">
                  {t("message")}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  className="form-control"
                  rows="5"
                  required
                ></textarea>
              </div>

              <button className="btn btn-primary-custom" type="submit">
                {t("sendMessage")}
              </button>

              {message && (
                <p className="small text-success mt-3 mb-0">{message}</p>
              )}
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
