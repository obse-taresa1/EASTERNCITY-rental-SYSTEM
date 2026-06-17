import SimplePublicPage from "./SimplePublicPage.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function OurStoryPage() {
  const { t } = useLanguage();

  return (
    <SimplePublicPage
      title={t("ourStoryTitle")}
      subtitle={t("ourStorySubtitle")}
    >
      <p>{t("ourStoryBody")}</p>
    </SimplePublicPage>
  );
}
