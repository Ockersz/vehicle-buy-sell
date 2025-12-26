import { useLanguage } from "../../app/LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  return (
    <select
      className="select select-bordered select-sm"
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label={t("nav.language")}
    >
      <option value="en">{t("lang.english")}</option>
      <option value="si">{t("lang.sinhala")}</option>
    </select>
  );
}
