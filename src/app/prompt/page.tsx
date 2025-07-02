"use client";

import React, { Suspense } from "react";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FilterBar from "./FilterBar";
import PromptCard from "./PromptCard";
import { trpc } from "@/lib/trpc/client";
import { useSearchParams } from "next/navigation";
import { PromptListSkeleton } from "@/components/ui/loading";
import { useRealtimePrompts } from "@/hooks/useRealtimePrompts";

const PAGE_SIZE = 12;

function getPageUrl({ page, category, q }: { page: number; category?: string; q?: string }) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  return `/prompt${params.toString() ? `?${params}` : ""}`;
}

function PromptPageContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") || undefined;
  const page = Number(searchParams.get("page")) || 1;

  // 실시간 프롬프트 업데이트 구독
  useRealtimePrompts({
    enabled: true,
    showToasts: true,
  });

  // tRPC를 사용한 프롬프트 데이터 조회
  const { data, isLoading, error } = trpc.prompt.getPrompts.useQuery({
    category,
    q,
    page,
    pageSize: PAGE_SIZE,
  });

  const { prompts = [], totalPages = 1 } = data || {};

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">데이터를 불러오는데 실패했습니다.</p>
            <Button onClick={() => window.location.reload()}>다시 시도</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <FileText className="size-8" /> 프롬프트 허브
          </h1>
          <Link href="/prompt/new">
            <Button variant="default" className="gap-2">
              <Plus className="size-4" /> 새 프롬프트
            </Button>
          </Link>
        </div>

        {/* 필터 바 */}
        <FilterBar defaultCategory={category} defaultQ={q} />

        <div className="mt-8">
          {isLoading ? (
            <PromptListSkeleton count={PAGE_SIZE} />
          ) : prompts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>조건에 맞는 프롬프트가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <Link href={getPageUrl({ page: Math.max(1, page - 1), category, q })}>
              <Button variant="outline" size="sm" disabled={page === 1}>
                이전
              </Button>
            </Link>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Link key={i + 1} href={getPageUrl({ page: i + 1, category, q })}>
                <Button
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  className={page === i + 1 ? "font-bold" : ""}
                >
                  {i + 1}
                </Button>
              </Link>
            ))}
            <Link href={getPageUrl({ page: Math.min(totalPages, page + 1), category, q })}>
              <Button variant="outline" size="sm" disabled={page === totalPages}>
                다음
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PromptPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<PromptListSkeleton count={PAGE_SIZE} />}>
        <PromptPageContent />
      </Suspense>
    </div>
  );
}
