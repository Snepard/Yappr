import { create } from "zustand";

const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("yappr-theme");
    if (savedTheme) return savedTheme;
  }
  return "default";
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  setTheme: (newTheme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("yappr-theme", newTheme);
      if (newTheme === "neubrutalism") {
        document.documentElement.classList.add("theme-neubrutalism");
      } else {
        document.documentElement.classList.remove("theme-neubrutalism");
      }
    }
    set({ theme: newTheme });
  },

  initTheme: () => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("yappr-theme") || "default";
      if (savedTheme === "neubrutalism") {
        document.documentElement.classList.add("theme-neubrutalism");
      } else {
        document.documentElement.classList.remove("theme-neubrutalism");
      }
      set({ theme: savedTheme });
    }
  }
}));
