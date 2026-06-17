import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import logo from "../../assets/images/logo.png";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="motorx-footer">
      <div className="container">
        <div className="footer-flex">
          <div>
            <Link className="motorx-logo text-white mb-3 d-inline-block" to="/">
              <img src={logo} alt="CityRent Logo" />
            </Link>
            <p className="small">{t("footerTagline")}</p>
          </div>

          <div>
            <h5>{t("about")}</h5>
            <Link to="/our-story">{t("ourStory")}</Link>
            <Link to="/careers">{t("careers")}</Link>
          </div>

          <div>
            <h5>{t("contact")}</h5>
            <Link to="/contact">{t("contact")}</Link>
            <a href="mailto:support@cityrent.com">support@cityrent.com</a>
          </div>

          <div>
            <h5>{t("legal")}</h5>
            <Link to="/privacy-policy">{t("privacyPolicy")}</Link>
            <Link to="/terms">{t("terms")}</Link>
          </div>

          <div>
            <div className="top-bar-social">
              <a href="#" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="mb-0">&copy; 2026 CityRent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
