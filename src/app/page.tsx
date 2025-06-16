import { FileText, Heart, List, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Prompt {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  category_id?: string | null;
  user_id?: string;
}

interface Category {
  id: string;
  name: string;
}

// 최신 프롬프트 3개
async function getPrompts(): Promise<Prompt[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase
    .from("prompts")
    .select("id, title, content, created_at")
    .order("created_at", { ascending: false })
    .limit(3);
  return data || [];
}

// 전체 통계
async function getStats() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [{ count: promptCount }, { count: userCount }, { count: categoryCount }] = await Promise.all([
    supabase.from("prompts").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);
  return {
    promptCount: promptCount || 0,
    userCount: userCount || 0,
    categoryCount: categoryCount || 0,
  };
}

// 인기 프롬프트 Top 3 (좋아요 많은 순)
async function getPopularPrompts(): Promise<(Prompt & { likeCount: number })[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  // likes 테이블에서 prompt_id별 count 집계
  const { data: likesData } = await supabase.from("likes").select("prompt_id");
  const likeMap: Record<string, number> = {};
  likesData?.forEach((row: { prompt_id: string }) => {
    likeMap[row.prompt_id] = (likeMap[row.prompt_id] || 0) + 1;
  });
  // 상위 3개 prompt_id 추출
  const topPromptIds = Object.entries(likeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);
  if (topPromptIds.length === 0) return [];
  // 프롬프트 정보 가져오기
  const { data: prompts } = await supabase
    .from("prompts")
    .select("id, title, content, created_at, category_id, user_id")
    .in("id", topPromptIds);
  // likeCount 포함해서 반환
  return prompts?.map((p) => ({ ...p, likeCount: likeMap[p.id] || 0 })).sort((a, b) => b.likeCount - a.likeCount) || [];
}

// 카테고리별 프롬프트 개수
async function getCategoryPromptCounts(): Promise<{ id: string; name: string; count: number }[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: categories } = await supabase.from("categories").select("id, name");
  if (!categories) return [];
  const { data: prompts } = await supabase.from("prompts").select("id, category_id");
  const countMap: Record<string, number> = {};
  prompts?.forEach((p: { category_id: string }) => {
    if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
  });
  return categories.map((c: Category) => ({ ...c, count: countMap[c.id] || 0 }));
}

export default async function Home() {
  const [latestPrompts, stats, popularPrompts, categoryCounts] = await Promise.all([
    getPrompts(),
    getStats(),
    getPopularPrompts(),
    getCategoryPromptCounts(),
  ]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-between p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">
      <header className="w-full flex flex-col items-center gap-4 mt-8">
        <h1 className="text-3xl font-bold tracking-tight">Promptory</h1>
        <p className="text-muted-foreground text-base text-center max-w-md">
          AI 프롬프트를 쉽고 빠르게 관리하고 공유하세요.
        </p>
      </header>
      <main className="flex flex-col items-center gap-8 w-full max-w-2xl flex-1 justify-center">
        {/* 상단 통계 */}
        <section className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="flex flex-col items-center p-4 rounded-lg bg-card border shadow-sm">
            <FileText className="size-6 mb-1" />
            <div className="text-2xl font-bold">{stats.promptCount}</div>
            <div className="text-xs text-muted-foreground">전체 프롬프트</div>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-card border shadow-sm">
            <Users className="size-6 mb-1" />
            <div className="text-2xl font-bold">{stats.userCount}</div>
            <div className="text-xs text-muted-foreground">전체 유저</div>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-card border shadow-sm">
            <List className="size-6 mb-1" />
            <div className="text-2xl font-bold">{stats.categoryCount}</div>
            <div className="text-xs text-muted-foreground">카테고리</div>
          </div>
        </section>

        {/* 인기 프롬프트 */}
        <section className="w-full mt-8">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Heart className="size-5" /> 인기 프롬프트
          </h2>
          <div className="flex flex-col gap-4">
            {popularPrompts.length === 0 && <p className="text-muted-foreground">좋아요가 많은 프롬프트가 없습니다.</p>}
            {popularPrompts.map((p) => (
              <div key={p.id} className="p-4 border rounded-lg shadow-sm bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-base truncate flex-1">{p.title}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Heart className="size-4" />
                    {p.likeCount}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground line-clamp-2 mb-1">{p.content}</div>
                <div className="text-xs text-right text-gray-400">{p.created_at?.slice(0, 10)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 카테고리별 프롬프트 개수 */}
        <section className="w-full mt-8">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <List className="size-5" /> 카테고리별 프롬프트
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categoryCounts.map((c) => (
              <div key={c.id} className="p-3 border rounded-lg bg-card flex flex-col items-center">
                <span className="font-semibold text-base mb-1">{c.name}</span>
                <span className="text-2xl font-bold">{c.count}</span>
                <span className="text-xs text-muted-foreground">프롬프트</span>
              </div>
            ))}
          </div>
        </section>

        {/* 최신 프롬프트 */}
        <section className="w-full mt-8">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <FileText className="size-5" /> 최신 프롬프트
          </h2>
          <div className="flex flex-col gap-4">
            {latestPrompts.length === 0 && <p className="text-muted-foreground">프롬프트가 없습니다.</p>}
            {latestPrompts.map((p) => (
              <div key={p.id} className="p-4 border rounded-lg shadow-sm bg-card">
                <div className="font-semibold text-base mb-1 truncate">{p.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2 mb-1">{p.content}</div>
                <div className="text-xs text-right text-gray-400">{p.created_at?.slice(0, 10)}</div>
              </div>
            ))}
          </div>
          {latestPrompts.length > 0 && (
            <div className="flex justify-center mt-6">
              <Link href="/prompt">
                <Button variant="outline" className="px-6">
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
