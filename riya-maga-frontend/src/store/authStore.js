import { create } from "zustand";

const LS_KEY = "auth";

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "null");
  } catch {
    return null;
  }
};

const write = (v) => localStorage.setItem(LS_KEY, JSON.stringify(v));

export const useAuthStore = create((set, get) => ({
  accessToken: read()?.accessToken || null,
  refreshToken: read()?.refreshToken || null,
  phone: null, // last used phone (optional UX)

  isAuthed: () => Boolean(get().accessToken),

  setTokens: ({ accessToken, refreshToken, phone }) => {
    const payload = { accessToken, refreshToken };
    write(payload);
    set({ accessToken, refreshToken, phone: phone || null });
  },

  logout: () => {
    localStorage.removeItem(LS_KEY);
    set({ accessToken: null, refreshToken: null, phone: null });
  },
}));
