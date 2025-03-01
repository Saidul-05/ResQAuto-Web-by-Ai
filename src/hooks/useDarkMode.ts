import { useState, useEffect } from "react";

type Theme = "dark" | "light" | "system";

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for stored theme preference
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") as Theme | null;
      if (storedTheme) {
        return storedTheme;
      }
      // Check for system preference
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "system";
      }
    }
    return "light";
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Update the theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    // Determine if dark mode should be active
    const isDark =
      theme === "dark" || (theme === "system" && systemTheme === "dark");

    // Update state
    setIsDarkMode(isDark);

    // Update DOM
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save preference
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const newIsDark = mediaQuery.matches;
      setIsDarkMode(newIsDark);

      const root = window.document.documentElement;
      if (newIsDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return { theme, setTheme, isDarkMode };
}
