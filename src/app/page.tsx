import { FileText } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PromptCard from "@/app/prompt/PromptCard";

interface Prompt {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id?: string | null;
  created_at?: string;
}

// 최신 프롬프트 3개
async function getPrompts(): Promise<Prompt[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase
    .from("prompts")
    .select("id, title, content, created_at, user_id, category_id, like_count")
    .order("created_at", { ascending: false })
    .limit(3);
  return data || [];
}

async function getLikeCounts(promptIds: string[]): Promise<Record<string, number>> {
  if (promptIds.length === 0) return {};
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.from("likes").select("prompt_id");
  console.log("data", data);
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

async function getCategories(): Promise<Category[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.from("categories").select("id, name");
  return data || [];
}

const blogPosts = [
  {
    id: "1",
    title: "AI 프롬프트 관리 꿀팁 5가지",
    summary: "AI 프롬프트를 효과적으로 관리하는 방법을 소개합니다.",
    url: "#",
    date: "2024-06-01",
  },
  {
    id: "2",
    title: "Promptory로 협업하는 방법",
    summary: "Promptory를 활용한 팀 협업 노하우를 알아보세요.",
    url: "#",
    date: "2024-05-28",
  },
  {
    id: "3",
    title: "AI 프롬프트 트렌드 2024",
    summary: "2024년 주목해야 할 AI 프롬프트 트렌드를 정리했습니다.",
    url: "#",
    date: "2024-05-20",
  },
];

export default async function Home() {
  const latestPrompts = await getPrompts();
  const categories = await getCategories();
  const likeCounts = await getLikeCounts(latestPrompts.map((p) => p.id));
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-col min-h-screen items-center justify-between p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">
      <header className="w-full flex flex-col items-center gap-4 mt-16 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Promptory</h1>
        <p className="text-muted-foreground text-lg text-center max-w-xl mt-2">
          AI 프롬프트를 쉽고 빠르게 관리하고 공유하는 서비스입니다.
          <br />
          팀과 함께 프롬프트를 저장하고, 최신 트렌드를 확인해보세요.
        </p>
        <div className="mt-6">
          <Link href="/prompt">
            <Button className="px-8 py-2 text-base font-semibold">프롬프트 둘러보기</Button>
          </Link>
        </div>
      </header>
      <main className="flex flex-col items-center gap-12 w-full max-w-2xl flex-1 justify-center">
        {/* 최신 프롬프트 */}
        <section className="w-full">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <FileText className="size-5" /> 최신 프롬프트
          </h2>
          <div className="flex flex-col gap-4">
            {latestPrompts.length === 0 && <p className="text-muted-foreground">프롬프트가 없습니다.</p>}
            {latestPrompts.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                categoryName={p.category_id ? categoryMap[p.category_id] : undefined}
                likeCount={likeCounts[p.id] || 0}
              />
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

        {/* 블로그 글 */}
        <section className="w-full">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <span className="size-5">📝</span> 블로그
          </h2>
          <div className="flex flex-col gap-4">
            {blogPosts.map((post) => (
              <a
                key={post.id}
                href={post.url}
                className="block p-4 border rounded-lg bg-card hover:bg-accent transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="font-semibold text-base mb-1 truncate">{post.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2 mb-1">{post.summary}</div>
                <div className="text-xs text-right text-gray-400">{post.date}</div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
