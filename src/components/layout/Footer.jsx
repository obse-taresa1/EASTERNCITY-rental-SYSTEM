import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import logo from "../../assets/images/logo.png";

const SOCIAL_LINKS = [
  { icon: "bi-facebook",  href: "#", label: "Facebook" },
  { icon: "bi-instagram", href: "#", label: "Instagram" },
  { icon: "bi-twitter-x", href: "#", label: "Twitter / X" },
  { icon: "bi-telegram",  href: "#", label: "Telegram" },
  { icon: "bi-youtube",   href: "#", label: "YouTube" },
];

const SERVICE_AREAS = [
  { name: "Jigjiga",   icon: "bi-geo-alt-fill" },
  { name: "Dire Dawa", icon: "bi-geo-alt-fill" },
  { name: "Harar",     icon: "bi-geo-alt-fill" },
];



export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer-premium">
      {/* Red accent top bar */}
      <div className="footer-top-accent"></div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">

            {/* Col 1 — Brand */}
            <div className="footer-col footer-brand-col">
              <Link to="/" className="footer-logo-link">
                <img src={logo} alt="EasternCity Logo" className="footer-logo-img" />
              </Link>
              <p className="footer-tagline">{t("footerTagline")}</p>
              <div className="footer-social-row">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="footer-social-icon"
                  >
                    <i className={`bi ${s.icon}`}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2 — Service Areas */}
            <div className="footer-col">
              <h5 className="footer-col-title">{t("location") || "Service Areas"}</h5>
              <ul className="footer-area-list">
                {SERVICE_AREAS.map((area) => (
                  <li key={area.name} className="footer-area-item">
                    <span className="footer-area-dot"></span>
                    <i className={`bi ${area.icon} text-danger me-2`}></i>
                    <span>{area.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Quick Links */}
            <div className="footer-col">
              <h5 className="footer-col-title">Quick Links</h5>
              <ul className="footer-link-list">
                <li><Link to="/">{t("home")}</Link></li>
                <li><Link to="/items">{t("categories")}</Link></li>
                <li><Link to="/about">{t("about")}</Link></li>
                <li><Link to="/contact">{t("contactUs")}</Link></li>
                <li><Link to="/privacy-policy">{t("privacyPolicy")}</Link></li>
                <li><Link to="/terms">{t("terms")}</Link></li>
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div className="footer-col">
              <h5 className="footer-col-title">{t("contact")}</h5>
              <ul className="footer-contact-list">
                <li>
                  <i className="bi bi-envelope-fill text-danger me-2"></i>
                  <a href="mailto:support@easterncities.com">support@easterncities.com</a>
                </li>
                <li>
                  <i className="bi bi-telephone-fill text-danger me-2"></i>
                  <a href="tel:+251900000000">+251 90 000 0000</a>
                </li>
                <li>
                  <i className="bi bi-clock-fill text-danger me-2"></i>
                  <span>Mon – Sat, 8:00 AM – 8:00 PM</span>
                </li>
                <li>
                  <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                  <span>Jigjiga / Dire Dawa / Harar</span>
                </li>
              </ul>
            </div>



          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom-bar">
        <div className="container">
          <div className="footer-bottom-inner">
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} EasternCities. All rights reserved.
            </p>
            <p className="footer-built-with">
              <i className="bi bi-heart-fill text-danger me-1"></i>
              Built for Jigjiga, Dire Dawa &amp; Harar
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
