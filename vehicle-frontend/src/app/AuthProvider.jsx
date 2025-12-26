import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProfile, requestOtp, verifyOtp } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("user");
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!token || user) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getProfile();
        if (res?.user) {
          setUser(res.user);
          localStorage.setItem("user", JSON.stringify(res.user));
        }
      } catch (err) {
        console.error("profile", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user]);

  const startOtp = async (phone) => {
    setError("");
    setOtpSent(false);
    try {
      setLoading(true);
      await requestOtp(phone);
      setOtpSent(true);
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "OTP failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeOtp = async (phone, code) => {
    setError("");
    try {
      setLoading(true);
      const res = await verifyOtp(phone, code);
      if (res?.access_token) {
        setToken(res.access_token);
        localStorage.setItem("access_token", res.access_token);
      }
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Verification failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      otpSent,
      startOtp,
      completeOtp,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [user, token, loading, error, otpSent]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
