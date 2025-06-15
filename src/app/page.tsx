"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Mail, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

interface EmailDialogProps {
  email: string;
  onClose: () => void;
}

function EmailDialog({ email, onClose }: EmailDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>이메일 체험 결과</DialogTitle>
        <DialogDescription>
          입력하신 이메일: <span className="font-semibold">{email}</span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button onClick={onClose} variant="default">
            닫기
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen items-center justify-between p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">
      <header className="w-full flex flex-col items-center gap-4 mt-8">
        <Image className="dark:invert" src="/next.svg" alt="서비스 로고" width={120} height={32} priority />
        <h1 className="text-3xl font-bold tracking-tight">Promptory</h1>
        <p className="text-muted-foreground text-base text-center max-w-md">
          AI 프롬프트를 쉽고 빠르게 관리하고 공유하세요.
        </p>
      </header>
      <main className="flex flex-col items-center gap-8 w-full max-w-md flex-1 justify-center">
        <div className="flex gap-4 w-full justify-center">
          <SignInButton mode="modal">
            <Button variant="default" size="lg" className="w-1/2 flex gap-2 items-center justify-center" type="button">
              <LogIn className="size-5" /> 구글 로그인
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="secondary" size="lg" className="w-1/2 flex gap-2 items-center justify-center">
              <UserPlus className="size-5" /> 회원가입
            </Button>
          </SignUpButton>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
            className="flex flex-col gap-4 w-full"
          >
            <label className="text-sm font-medium flex items-center gap-2" htmlFor="email-input">
              <Mail className="size-4" /> 이메일로 체험해보기
            </label>
            <div className="flex gap-2 w-full">
              <Input
                id="email-input"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <DialogTrigger asChild>
                <Button type="submit" variant="outline">
                  체험
                </Button>
              </DialogTrigger>
            </div>
          </form>
          {open && <EmailDialog email={email} onClose={() => setOpen(false)} />}
        </Dialog>
      </main>
      <footer className="flex gap-6 flex-wrap items-center justify-center py-6 w-full border-t mt-8">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm"
          href="https://nextjs.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} /> Next.js
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm"
          href="https://vercel.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/vercel.svg" alt="Vercel icon" width={16} height={16} /> Vercel
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm"
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} /> GitHub
        </a>
      </footer>
    </div>
  );
}
