import { useLanguage } from "../../context/LanguageContext.jsx";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="language-switcher" aria-label={t("language")}>
      <i className="bi bi-globe2" aria-hidden="true"></i>
      <select
        value={language}
        aria-label={t("language")}
        onChange={(event) => setLanguage(event.target.value)}
      >
        <option value="en">English</option>
        <option value="om">Afaan Oromo</option>
        <option value="am">አማርኛ</option>
        <option value="so">Af-Soomaali</option>
      </select>
    </label>
  );
}
