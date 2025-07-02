"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PromptCard from "@/app/prompt/PromptCard";
import { TextScramble } from "@/components/ui/TextScramble";
import { trpc } from "@/lib/trpc/client";
import { PromptListSkeleton } from "@/components/ui/loading";

export default function Home() {
  // tRPC를 사용한 최적화된 데이터 fetching
  const { data: latestPrompts = [], isLoading, error } = trpc.prompt.getLatestPrompts.useQuery({ limit: 3 });

  return (
    <div className="flex flex-col min-h-screen items-center justify-between font-[family-name:var(--font-geist-sans)] bg-background">
      <header className="w-full flex flex-col items-center gap-4 mt-16 mb-12">
        <h1 className="text-6xl font-bold tracking-tight">
          <TextScramble text="Promptory" className="text-6xl font-bold tracking-tight" />
        </h1>
        <p className="text-muted-foreground text-lg text-center max-w-xl mt-2">
          AI 프롬프트를 쉽고 빠르게 관리하고 공유하는 서비스입니다.
          <br />
          팀과 함께 프롬프트를 저장하고, 최신 트렌드를 확인해보세요.
        </p>
        <div className="mt-6">
          <Link href="/prompt">
            <Button className="px-8 py-2 text-base font-semibold cursor-pointer">프롬프트 둘러보기</Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-col items-center gap-12 w-full max-w-2xl flex-1 mt-12">
        {/* 최신 프롬프트 */}
        <section className="w-full">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <FileText className="size-5" /> 최신 프롬프트
          </h2>

          <div className="flex flex-col gap-4">
            {isLoading && <PromptListSkeleton count={3} />}

            {error && <div className="text-red-500">프롬프트를 불러오는데 실패했습니다.</div>}

            {!isLoading && !error && latestPrompts.length === 0 && (
              <p className="text-muted-foreground">프롬프트가 없습니다.</p>
            )}

            {!isLoading && latestPrompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}
          </div>

          {latestPrompts.length > 0 && (
            <div className="flex justify-center mt-6">
              <Link href="/prompt">
                <Button variant="outline" className="px-6 cursor-pointer">
                  더보기
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
