import { useNavigate, useLocation } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../app/AuthProvider";
import { useLanguage } from "../../app/LanguageProvider";

export default function WebNavbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const active = (path) =>
    loc.pathname === path ? "btn btn-sm btn-primary" : "btn btn-sm btn-ghost";

  return (
    <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto w-full px-4 flex justify-between gap-3 items-center">
        <button
          className="flex items-center gap-3"
          onClick={() => nav("/")}
        >
          <div className="text-xl font-bold">{t("brand")}</div>
          <span className="badge badge-outline hidden md:flex">{t("tagline")}</span>
        </button>

        <div className="hidden md:flex flex-1 max-w-lg">
          <input
            className="input input-bordered w-full"
            placeholder={t("hero.searchPlaceholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter") nav(`/search?q=${encodeURIComponent(e.target.value)}`);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button className={active("/")} onClick={() => nav("/")}>
            {t("nav.home")}
          </button>
          <button className={active("/search")} onClick={() => nav("/search")}>
            {t("nav.search")}
          </button>
          <button className={active("/sell")} onClick={() => nav("/sell")}>
            {t("nav.sell")}
          </button>

          <ThemeToggle />
          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-sm btn-outline">
                {user?.name || user?.phone || t("nav.profile")}
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                  <button onClick={() => nav("/profile")}>{t("nav.profile")}</button>
                </li>
                <li>
                  <button onClick={logout}>{t("nav.logout")}</button>
                </li>
              </ul>
            </div>
          ) : (
            <button className="btn btn-sm btn-primary" onClick={() => nav("/profile")}>
              {t("nav.login")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
