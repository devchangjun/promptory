import { FileText } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterBar from "./FilterBar";
import { Suspense } from "react";

interface Prompt {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id?: string | null;
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
}

async function getCategories(): Promise<Category[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.from("categories").select("id, name");
  return data || [];
}

const PAGE_SIZE = 10;

async function getPrompts({
  category,
  q,
  page,
}: {
  category?: string;
  q?: string;
  page?: number;
}): Promise<{ prompts: Prompt[]; total: number }> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  let query = supabase
    .from("prompts")
    .select("id, title, content, user_id, created_at, category_id", { count: "exact" })
    .order("created_at", { ascending: false });
  if (category) query = query.eq("category_id", category);
  if (q) query = query.ilike("title", `%${q}%`);
  const from = ((page || 1) - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);
  const { data, count } = await query;
  return { prompts: data || [], total: count || 0 };
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
  searchParams: { category?: string; q?: string; page?: string };
}) {
  const categories = await getCategories();
  const page = Number(searchParams.page) || 1;
  const { prompts, total } = await getPrompts({ category: searchParams.category, q: searchParams.q, page });
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="size-6" /> 프롬프트 전체 목록
        </h1>
        <Link href="/prompt/new">
          <Button variant="default" className="gap-2">
            <Plus className="size-4" /> 프롬프트 추가하기
          </Button>
        </Link>
      </div>
      <Suspense fallback={<div className="mb-6">필터 로딩중...</div>}>
        <FilterBar categories={categories} defaultCategory={searchParams.category} defaultQ={searchParams.q} />
      </Suspense>
      <div className="flex flex-col gap-4 mt-6">
        {prompts.length === 0 && <p className="text-muted-foreground">프롬프트가 없습니다.</p>}
        {prompts.map((p) => (
          <Link
            key={p.id}
            href={`/prompt/${p.id}`}
            className="p-4 border rounded-lg shadow-sm bg-card transition hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 block"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold text-lg truncate">{p.title}</div>
              {p.category_id && categoryMap[p.category_id] && (
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  {categoryMap[p.category_id]}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2 mb-1">{p.content}</div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>작성자: {p.user_id}</span>
              <span>{p.created_at?.slice(0, 10)}</span>
            </div>
          </Link>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Link href={getPageUrl({ page: Math.max(1, page - 1), category: searchParams.category, q: searchParams.q })}>
            <Button variant="outline" size="sm" disabled={page === 1}>
              이전
            </Button>
          </Link>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link key={i + 1} href={getPageUrl({ page: i + 1, category: searchParams.category, q: searchParams.q })}>
              <Button
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                className={page === i + 1 ? "font-bold" : ""}
              >
                {i + 1}
              </Button>
            </Link>
          ))}
          <Link
            href={getPageUrl({
              page: Math.min(totalPages, page + 1),
              category: searchParams.category,
              q: searchParams.q,
            })}
          >
            <Button variant="outline" size="sm" disabled={page === totalPages}>
              다음
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
