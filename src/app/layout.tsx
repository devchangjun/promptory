import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "@/lib/trpc/Provider";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Promptory - AI 프롬프트 라이브러리",
  description: "AI 프롬프트를 공유하고 발견하는 플랫폼입니다.",
  keywords: ["AI", "프롬프트", "ChatGPT", "Claude", "Gemini"],
  authors: [{ name: "Promptory Team" }],
  creator: "Promptory",
  publisher: "Promptory",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Promptory - AI 프롬프트 라이브러리",
    description: "AI 프롬프트를 공유하고 발견하는 플랫폼입니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "Promptory",
  },
  twitter: {
    card: "summary_large_image",
    title: "Promptory - AI 프롬프트 라이브러리",
    description: "AI 프롬프트를 공유하고 발견하는 플랫폼입니다.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Promptory" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#ffffff" />
        {/* Pretendard 폰트 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body
        className={`min-h-screen bg-background ${geistSans.variable} ${geistMono.variable} antialiased font-[Pretendard, var(--font-geist-sans)]`}
        style={{
          fontFamily: "Pretendard, var(--font-geist-sans), sans-serif",
        }}
      >
        <ThemeProvider>
          <Provider>
            <ClerkProvider>
              <Header />
              {children}
              <Toaster />
            </ClerkProvider>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
