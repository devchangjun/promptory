"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    // 클라이언트 사이드에서 테마 초기화
    initializeTheme();
  }, [initializeTheme]);

  return <>{children}</>;
}
