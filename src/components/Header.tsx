"use client";
import Link from "next/link";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Home, FileText, BookOpen } from "lucide-react";

export default function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="w-full h-16 flex items-center justify-between px-6 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="flex items-center gap-2 sm:gap-4">
        <Link href="/" className="flex items-center gap-1 font-bold text-lg">
          <Home className="size-5" /> 홈
        </Link>
        <Link
          href="/prompt"
          className="flex items-center gap-1 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <FileText className="size-5" /> 프롬프트
        </Link>
        <Link
          href="/blog"
          className="flex items-center gap-1 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <BookOpen className="size-5" /> 블로그
        </Link>
      </nav>
      <div className="flex items-center gap-2">
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <SignInButton mode="modal">
            <Button variant="outline" size="sm">
              로그인
            </Button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}
