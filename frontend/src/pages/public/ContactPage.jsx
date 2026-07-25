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
          <style>{`
            .contact-shiny-box {
              background: linear-gradient(135deg, #e31e24 0%, #b3161c 100%) !important;
              position: relative;
              overflow: hidden;
              box-shadow: 0 10px 25px rgba(227, 30, 36, 0.3) !important;
              border-radius: 12px !important;
              color: white !important;
              border: none !important;
              transition: transform 0.3s ease, box-shadow 0.3s ease !important;
            }
            .contact-shiny-box:hover {
              transform: translateY(-5px);
              box-shadow: 0 15px 35px rgba(227, 30, 36, 0.4) !important;
            }
            .contact-shiny-box::before {
              content: '';
              position: absolute;
              top: 0;
              left: -150%;
              width: 50%;
              height: 100%;
              background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
              transform: skewX(-25deg);
              transition: left 0.6s ease;
              pointer-events: none;
            }
            .contact-shiny-box:hover::before {
              left: 150%;
            }
            .contact-form-shiny {
              position: relative;
              overflow: hidden;
              transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease !important;
            }
            .contact-form-shiny:hover {
              transform: translateY(-5px);
              border-color: #e31e24 !important;
              box-shadow: 0 10px 30px rgba(227, 30, 36, 0.25), 0 0 15px rgba(227, 30, 36, 0.4) !important;
            }
            .contact-form-shiny::before {
              content: '';
              position: absolute;
              top: 0;
              left: -150%;
              width: 50%;
              height: 100%;
              background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(227, 30, 36, 0.1) 50%, rgba(255,255,255,0) 100%);
              transform: skewX(-25deg);
              transition: left 0.6s ease;
              pointer-events: none;
            }
            .contact-form-shiny:hover::before {
              left: 150%;
            }
          `}</style>
          <section className="card card-custom p-4 h-100 contact-shiny-box text-white border-0">
            <span className="section-label text-white-50" style={{background: 'rgba(255,255,255,0.1)'}}>{t("contactEyebrow")}</span>
            <h1 className="h3 mb-3">{t("contactUs")}</h1>
            <p className="text-white-50 mb-5">
              {t("contactLead")}
            </p>

            <p className="mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-envelope fs-4"></i> support@cityrent.com
            </p>
            <p className="mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-geo-alt fs-4"></i> {t("contactLocation")}
            </p>
          </section>
        </div>

        <div className="col-lg-7">
          <section className="card card-custom p-4 contact-form-shiny">
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
