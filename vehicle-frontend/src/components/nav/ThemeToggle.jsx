import { useTheme } from "../../app/ThemeProvider";
import { useLanguage } from "../../app/LanguageProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const next = theme === "light" ? t("theme.dark") : t("theme.light");
  return (
    <button className="btn btn-ghost btn-sm" onClick={toggleTheme} aria-label={t("nav.theme")}>
      {theme === "light" ? "☀️" : "🌙"} {next}
    </button>
  );
}
