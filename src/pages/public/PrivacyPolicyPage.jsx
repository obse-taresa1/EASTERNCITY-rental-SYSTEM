import SimplePublicPage from "./SimplePublicPage.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  return (
    <SimplePublicPage title={t("privacyPolicy")}>
      <p>{t("privacyBody")}</p>
    </SimplePublicPage>
  );
}
