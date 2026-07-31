// CroxCom theme helpers. Dark by default; persists to localStorage.

export type Theme = "dark" | "light";
const KEY = "croxcom-theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(KEY);
  return v === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export function setTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, theme);
  applyTheme(theme);
}

export const themeInitScript = `(function(){try{var t=localStorage.getItem('croxcom-theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`;
