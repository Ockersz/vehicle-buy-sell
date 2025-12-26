import { createContext, useContext, useMemo, useState, useEffect } from "react";
import en from "../i18n/en.json";
import si from "../i18n/si.json";

const LANGS = { en, si };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const stored = localStorage.getItem("lang") || "en";
  const [lang, setLang] = useState(LANGS[stored] ? stored : "en");

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const value = useMemo(() => {
    const dict = LANGS[lang] || LANGS.en;
    const t = (key) => dict[key] || key;
    return { lang, setLang, t, dict };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
