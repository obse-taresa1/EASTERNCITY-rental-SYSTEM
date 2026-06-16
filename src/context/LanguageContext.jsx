import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const translations = {
  en: {
    home: "Home",
    about: "About",
    contact: "Contact",
    items: "Search/Browse Items",
    loginRegister: "Login / Register",
    dashboard: "Dashboard",
    logout: "Logout",
    profile: "Profile",
    messages: "Messages",
    language: "Language",
    footerTagline: "Citywide Item Rental System - trusted rentals across your city.",
    ourStory: "Our Story",
    careers: "Careers",
    privacyPolicy: "Privacy Policy",
    terms: "Terms",
    support: "Support",
  },
  om: {
    home: "Mana",
    about: "Waa'ee Keenya",
    contact: "Nu Qunnami",
    items: "Meeshaalee Barbaadi/Ilaali",
    loginRegister: "Seeni / Galmaa'i",
    dashboard: "Daashboordii",
    logout: "Ba'i",
    profile: "Profaayilii",
    messages: "Ergaawwan",
    language: "Afaan",
    footerTagline: "Sirna kiraa meeshaalee magaalaa - kiraa amanamaa magaalaa kee keessatti.",
    ourStory: "Seenaa Keenya",
    careers: "Carraa Hojii",
    privacyPolicy: "Imaammata Dhuunfaa",
    terms: "Waliigaltee",
    support: "Gargaarsa",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en"); // ✅ Fixed

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("language", language);
  }, [language]);

  function t(key) {
    return translations[language]?.[key] || translations.en[key] || key; // ✅ Fixed
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      translations,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}