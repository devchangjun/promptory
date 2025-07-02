import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  systemTheme: "light" | "dark";
  currentTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getCurrentTheme = (theme: Theme, systemTheme: "light" | "dark"): "light" | "dark" => {
  return theme === "system" ? systemTheme : theme;
};

const applyTheme = (currentTheme: "light" | "dark") => {
  if (typeof window === "undefined") return;

  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(currentTheme);
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      systemTheme: "light",
      currentTheme: "light",

      setTheme: (theme: Theme) => {
        const systemTheme = getSystemTheme();
        const currentTheme = getCurrentTheme(theme, systemTheme);

        set({ theme, systemTheme, currentTheme });
        applyTheme(currentTheme);
      },

      initializeTheme: () => {
        const { theme } = get();
        const systemTheme = getSystemTheme();
        const currentTheme = getCurrentTheme(theme, systemTheme);

        set({ systemTheme, currentTheme });
        applyTheme(currentTheme);

        // 시스템 테마 변경 감지
        if (typeof window !== "undefined") {
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            const newSystemTheme = e.matches ? "dark" : "light";
            const currentState = get();
            const newCurrentTheme = getCurrentTheme(currentState.theme, newSystemTheme);

            set({ systemTheme: newSystemTheme, currentTheme: newCurrentTheme });
            applyTheme(newCurrentTheme);
          };

          mediaQuery.addEventListener("change", handleSystemThemeChange);

          // 클린업 함수 반환 (실제로는 컴포넌트 언마운트 시 처리해야 함)
          return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
        }
      },
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
