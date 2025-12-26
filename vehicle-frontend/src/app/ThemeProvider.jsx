import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext();
const THEMES = ["light", "dark"];

export function ThemeProvider({ children }) {
  const stored = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(THEMES.includes(stored) ? stored : "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
