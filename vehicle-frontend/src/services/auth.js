import { api } from "./api";

export async function requestOtp(phone) {
  const { data } = await api.post("/auth/request-otp", { phone });
  return data;
}

export async function verifyOtp(phone, code) {
  const { data } = await api.post("/auth/verify-otp", { phone, code });
  return data; // expect { access_token, user }
}

export async function getProfile() {
  const { data } = await api.get("/auth/me");
  return data;
}
