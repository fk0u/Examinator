// ~/lib/theme.ts
export type Theme = "light" | "dark";
export const THEME_KEY = "examinator-theme";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "light" || stored === "dark" ? stored : "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem(THEME_KEY, theme);
}

export function toggleTheme(): Theme {
  const current = getTheme();
  const next: Theme = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

export function initTheme() {
  applyTheme(getTheme());
}