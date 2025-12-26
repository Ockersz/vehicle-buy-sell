import { useState } from "react";
import { useAuth } from "../../app/AuthProvider";
import { useLanguage } from "../../app/LanguageProvider";

export default function OtpLoginCard({ title, compact = false }) {
  const { t } = useLanguage();
  const { startOtp, completeOtp, otpSent, loading, error } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState("phone");

  const submitPhone = async () => {
    const ok = await startOtp(phone);
    if (ok) setStage("code");
  };

  const submitCode = async () => {
    await completeOtp(phone, code);
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className={`card-body ${compact ? "p-4" : "p-6"} space-y-4`}>
        <div>
          <h2 className="text-lg font-semibold">{title || t("auth.loginToPost")}</h2>
          <p className="text-sm text-base-content/70">
            {stage === "phone" ? t("auth.requestOtp") : t("auth.sent")}
          </p>
        </div>

        <div className="grid gap-3">
          <label className="text-xs text-base-content/60">{t("auth.phone")}</label>
          <input
            className="input input-bordered w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07x xxx xxxx"
            type="tel"
          />

          {stage === "code" && (
            <>
              <label className="text-xs text-base-content/60">{t("auth.otp")}</label>
              <input
                className="input input-bordered w-full"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                type="text"
              />
            </>
          )}
        </div>

        {error && <div className="text-sm text-error">{error}</div>}

        <div className="flex gap-2">
          {stage === "phone" ? (
            <button className="btn btn-primary flex-1" onClick={submitPhone} disabled={loading || !phone}>
              {t("auth.requestOtp")}
            </button>
          ) : (
            <button className="btn btn-primary flex-1" onClick={submitCode} disabled={loading || !code}>
              {t("auth.verify")}
            </button>
          )}
          {otpSent && (
            <button className="btn btn-ghost" onClick={() => setStage("phone")} disabled={loading}>
              {t("filters.reset")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
