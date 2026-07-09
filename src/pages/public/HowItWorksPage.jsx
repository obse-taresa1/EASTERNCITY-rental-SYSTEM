import SimplePublicPage from "./SimplePublicPage.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function HowItWorksPage() {
  const { t } = useLanguage();

  return (
    <SimplePublicPage title={t("howItWorks")}>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card card-custom p-4 h-100">
            <i className="bi bi-search text-accent-custom fs-2"></i>
            <h5 className="mt-3">{t("howItWorksBrowseTitle")}</h5>
            <p className="text-muted mb-0">
              {t("howItWorksBrowseBody")}
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card card-custom p-4 h-100">
            <i className="bi bi-calendar-check text-accent-custom fs-2"></i>
            <h5 className="mt-3">{t("howItWorksBookTitle")}</h5>
            <p className="text-muted mb-0">
              {t("howItWorksBookBody")}
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card card-custom p-4 h-100">
            <i className="bi bi-box-seam text-accent-custom fs-2"></i>
            <h5 className="mt-3">{t("howItWorksPickupTitle")}</h5>
            <p className="text-muted mb-0">
              {t("howItWorksPickupBody")}
            </p>
          </div>
        </div>
      </div>
    </SimplePublicPage>
  );
}
