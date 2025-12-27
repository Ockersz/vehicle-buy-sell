import { api } from "./api";

export async function requestOtp(phone) {
  const res = await api.post("/auth/request-otp", { phone });
  return res.data; // { ok: true } (or similar)
}

export async function verifyOtp(phone, otp) {
  const res = await api.post("/auth/verify-otp", { phone, otp });
  return res.data; // { ok, access_token, refresh_token }
}
