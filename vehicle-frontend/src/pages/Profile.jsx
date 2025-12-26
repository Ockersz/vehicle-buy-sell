import OtpLoginCard from "../components/auth/OtpLoginCard";
import { useAuth } from "../app/AuthProvider";
import { useLanguage } from "../app/LanguageProvider";

export default function Profile() {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useLanguage();

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-0 space-y-3">
        <OtpLoginCard title={t("profile.loggedOut")} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0 space-y-3">
      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-2">
          <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
          <div className="text-sm text-base-content/70">{user?.phone || user?.name}</div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={logout}>
              {t("nav.logout")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
