import { FileText, Plus } from "lucide-react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FilterBar from "./FilterBar";
import { Suspense } from "react";
import PromptCard from "./PromptCard";
import { Prompt } from "@/schemas/promptSchema";

interface Category {
  id: string;
  name: string;
}

async function getCategories(): Promise<Category[]> {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from("categories").select("id, name");
  return data || [];
}

const PAGE_SIZE = 12;

async function getPrompts({
  category,
  q,
  page,
}: {
  category?: string;
  q?: string;
  page?: number;
}): Promise<{ prompts: Prompt[]; total: number }> {
  const supabase = createServerComponentClient({ cookies });

  // RPC를 사용하여 프롬프트 목록과 좋아요 수를 함께 가져옵니다.
  let query = supabase
    .from("prompts")
    .select("*, categories(name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category_id", category);
  if (q) query = query.ilike("title", `%${q}%`);

  const from = ((page || 1) - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching prompts:", error);
    return { prompts: [], total: 0 };
  }

  const prompts = data.map((p) => ({
    ...p,
    category: p.categories?.name,
  }));

  return { prompts: prompts || [], total: count || 0 };
}

function getPageUrl({ page, category, q }: { page: number; category?: string; q?: string }) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  return `/prompt${params.toString() ? `?${params}` : ""}`;
}

export default async function PromptPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { category, q, page } = await searchParams;
  const pageNumber = Number(page) || 1;

  const [{ prompts, total }, categories] = await Promise.all([
    getPrompts({ category, q, page: pageNumber }),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="size-8" /> 프롬프트 허브
        </h1>
        <Link href="/prompt/new">
          <Button variant="default" className="gap-2">
            <Plus className="size-4" /> 새 프롬프트
          </Button>
        </Link>
      </div>
      <Suspense fallback={<div className="mb-6">필터 로딩중...</div>}>
        <FilterBar categories={categories} defaultCategory={category} defaultQ={q} />
      </Suspense>
      <div className="mt-8">
        {prompts.length > 0 ? (
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
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Link href={getPageUrl({ page: Math.max(1, pageNumber - 1), category, q })}>
            <Button variant="outline" size="sm" disabled={pageNumber === 1}>
              이전
            </Button>
          </Link>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link key={i + 1} href={getPageUrl({ page: i + 1, category, q })}>
              <Button
                variant={pageNumber === i + 1 ? "default" : "outline"}
                size="sm"
                className={pageNumber === i + 1 ? "font-bold" : ""}
              >
                {i + 1}
              </Button>
            </Link>
          ))}
          <Link href={getPageUrl({ page: Math.min(totalPages, pageNumber + 1), category, q })}>
            <Button variant="outline" size="sm" disabled={pageNumber === totalPages}>
              다음
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
