import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function ContactPage() {
  const [message, setMessage] = useState("");
  const { t } = useLanguage();

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(t("messageSent"));
    event.currentTarget.reset();
  }

  return (
    <main className="container page-header pb-5">
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
                <input id="contact-name" className="form-control" required />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="contact-email">
                  {t("email")}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="contact-message">
                  {t("message")}
                </label>
                <textarea
                  id="contact-message"
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
