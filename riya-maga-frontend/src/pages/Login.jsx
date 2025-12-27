import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { requestOtp, verifyOtp } from "../services/auth";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("+94");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const setTokens = useAuthStore((s) => s.setTokens);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/sell";

  const onRequest = async () => {
    setErr("");
    setLoading(true);
    try {
      await requestOtp(phone);
      setStep(2);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "OTP request failed");
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp);
      if (!res?.access_token) throw new Error("No access_token returned");
      setTokens({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        phone,
      });
      navigate(from, { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "OTP verify failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h1 className="text-xl font-semibold">Login</h1>
      <p className="text-sm opacity-80 mt-1">
        You can browse without login. Login is needed to post an ad.
      </p>

      {err && <div className="mt-3 text-sm text-red-500">{err}</div>}

      {step === 1 && (
        <div className="mt-4 space-y-3">
          <label className="text-sm opacity-80">Phone</label>
          <input
            className="w-full rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+94770000000"
          />
          <button
            onClick={onRequest}
            disabled={loading}
            className="w-full rounded-xl py-2 font-semibold bg-blue-600 text-white disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send OTP"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4 space-y-3">
          <label className="text-sm opacity-80">OTP</label>
          <input
            className="w-full rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
          />
          <button
            onClick={onVerify}
            disabled={loading}
            className="w-full rounded-xl py-2 font-semibold bg-blue-600 text-white disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify & Continue"}
          </button>

          <button
            onClick={() => setStep(1)}
            className="w-full rounded-xl py-2 text-sm border border-gray-200 dark:border-gray-700"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
