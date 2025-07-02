"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore, type Theme } from "@/store/themeStore";

const themes: Theme[] = ["light", "dark", "system"];

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const Icon = themeIcons[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="size-8 rounded-md"
      title={`현재: ${theme === "light" ? "라이트" : theme === "dark" ? "다크" : "시스템"} 모드`}
    >
      <Icon className="size-4" />
      <span className="sr-only">테마 변경</span>
    </Button>
  );
}
