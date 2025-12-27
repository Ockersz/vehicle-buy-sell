import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("theme") || "light",
  toggleTheme: () =>
    set((state) => {
      const t = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", t);
      document.documentElement.classList.toggle("dark", t === "dark");
      return { theme: t };
    }),
}));
