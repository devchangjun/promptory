import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import SWRProvider from "@/components/SWRProvider";

export const metadata: Metadata = {
  title: "Promptory - 최고의 프롬프트 공유 플랫폼",
  description: "AI 프롬프트를 쉽고 빠르게 공유하고 검색하세요. 다양한 카테고리와 인기 프롬프트를 한눈에!",
  openGraph: {
    title: "Promptory - 최고의 프롬프트 공유 플랫폼",
    description: "AI 프롬프트를 쉽고 빠르게 공유하고 검색하세요.",
    url: "https://promptory.com",
    siteName: "Promptory",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Promptory 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Promptory - 최고의 프롬프트 공유 플랫폼",
    description: "AI 프롬프트를 쉽고 빠르게 공유하고 검색하세요.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: "index, follow",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://promptory.com" />
        <meta name="robots" content="index, follow" />
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
        {/* Pretendard 폰트 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body
        className={`min-h-screen bg-linear-45 from-indigo-200 via-purple-200 to-pink-200 ${geistSans.variable} ${geistMono.variable} antialiased font-[Pretendard, var(--font-geist-sans)]`}
        style={{ fontFamily: "Pretendard, var(--font-geist-sans), sans-serif" }}
      >
        <ClerkProvider>
          <SWRProvider>
            <Header />
            {children}
            <Toaster />
          </SWRProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
