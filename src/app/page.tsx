import { FileText } from "lucide-react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PromptCard from "@/app/prompt/PromptCard";
import { TextScramble } from "@/components/ui/TextScramble";
import { Prompt } from "@/schemas/promptSchema";
import { SupabaseClient } from "@supabase/supabase-js";

// 최신 프롬프트 3개
async function getPrompts(supabase: SupabaseClient): Promise<Prompt[]> {
  const { data } = await supabase
    .from("prompts")
    .select("id, title, content, created_at, user_id, category_id, like_count")
    .order("created_at", { ascending: false })
    .limit(3);
  return data || [];
}

async function getLikeCounts(supabase: SupabaseClient, promptIds: string[]): Promise<Record<string, number>> {
  if (promptIds.length === 0) return {};
  const { data } = await supabase.from("likes").select("prompt_id");
  const counts: Record<string, number> = {};
  data?.forEach((row: { prompt_id: string }) => {
    if (promptIds.includes(row.prompt_id)) {
      counts[row.prompt_id] = (counts[row.prompt_id] || 0) + 1;
    }
  });
  return counts;
}

interface Category {
  id: string;
  name: string;
}

async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data } = await supabase.from("categories").select("id, name");
  return data || [];
}

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  // 1. 필요한 데이터를 가져오는 Promise 배열 생성
  const promptsPromise = getPrompts(supabase);
  const categoriesPromise = getCategories(supabase);

  // 2. Promise.all로 데이터 요청 병렬 실행
  const [promptsData, categories] = await Promise.all([promptsPromise, categoriesPromise]);

  // 3. 프롬프트 데이터가 온 후에야 좋아요 수 요청
  const likeCounts = await getLikeCounts(
    supabase,
    promptsData.map((p) => p.id)
  );

  // 4. 데이터 조합
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const latestPrompts = promptsData.map((p) => ({
    ...p,
    category: p.category_id ? categoryMap[p.category_id] : undefined,
    likeCount: likeCounts[p.id] || 0,
  }));

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
            {latestPrompts.length === 0 && <p className="text-muted-foreground">프롬프트가 없습니다.</p>}
            {latestPrompts.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))}
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
