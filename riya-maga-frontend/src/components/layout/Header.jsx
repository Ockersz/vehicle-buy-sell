import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Header() {
  const { toggleTheme } = useThemeStore();
  const { t, i18n } = useTranslation();

  const switchLang = () => {
    const next = i18n.language === "en" ? "si" : "en";
    localStorage.setItem("lang", next);
    i18n.changeLanguage(next);
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          {t("appName")}
        </Link>

        <div className="flex items-center gap-3">
          <button onClick={switchLang} className="text-sm">
            {i18n.language === "en" ? "සිං" : "EN"}
          </button>

          <button onClick={toggleTheme}>
            <Sun className="h-5 w-5 dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
