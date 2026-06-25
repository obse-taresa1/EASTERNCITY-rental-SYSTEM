import SimplePublicPage from "./SimplePublicPage.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <SimplePublicPage title={t("terms")}>
      <p>{t("termsBody")}</p>
    </SimplePublicPage>
  );
}
