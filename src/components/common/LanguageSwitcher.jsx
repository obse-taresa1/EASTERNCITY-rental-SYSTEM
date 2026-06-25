import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";

const LANGUAGES = [
  { code: "en", abbr: "EN", label: "English" },
  { code: "am", abbr: "አማ", label: "አማርኛ" },
  { code: "so", abbr: "SO", label: "Somali" },
  { code: "af", abbr: "AF", label: "Afaan Oromo" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const current =
    LANGUAGES.find((lang) => lang.code === language) || LANGUAGES[0];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="language-switcher-modern" ref={ref}>
      <button
        type="button"
        className="language-globe-button"
        aria-label="Change language"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <i className="bi bi-globe2"></i>
        <span>{current.abbr}</span>
      </button>

      {open && (
        <div className="language-panel premium-glass-card">
          {LANGUAGES.map((lang) => (
            <button
              type="button"
              className={`language-option ${language === lang.code ? "is-active" : ""}`}
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
            >
              <span className="language-option-code">{lang.abbr}</span>
              <span>{lang.label}</span>
              {language === lang.code && (
                <i className="bi bi-check2-circle"></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
