import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../app/LanguageProvider";
import { useTheme } from "../../app/ThemeProvider";

export default function MobileBottomNav() {
  const nav = useNavigate();
  const loc = useLocation();
  const { t } = useLanguage();
  const { toggleTheme } = useTheme();

  const tab = (path) =>
    loc.pathname === path ? "btn btn-sm btn-primary" : "btn btn-sm btn-ghost";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-40">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2 gap-1">
        <button className={tab("/")} onClick={() => nav("/")}>
          {t("nav.home")}
        </button>
        <button className={tab("/search")} onClick={() => nav("/search")}>
          {t("nav.search")}
        </button>
        <button className="btn btn-sm btn-primary" onClick={() => nav("/sell")}>{t("nav.sell")}</button>
        <button className={tab("/profile")} onClick={() => nav("/profile")}>
          {t("nav.profile")}
        </button>
        <button className="btn btn-sm btn-ghost" onClick={toggleTheme} aria-label="Toggle theme">
          🌓
        </button>
      </div>
    </div>
  );
}
