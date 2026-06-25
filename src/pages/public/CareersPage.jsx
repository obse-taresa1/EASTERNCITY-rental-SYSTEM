import SimplePublicPage from "./SimplePublicPage.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function CareersPage() {
  const { t } = useLanguage();

  return (
    <SimplePublicPage
      title={t("careersTitle")}
      subtitle={t("careersSubtitle")}
    >
      <p>{t("careersBody")}</p>
    </SimplePublicPage>
  );
}
