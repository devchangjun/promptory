import { FileText } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Prompt {
  id: string;
  title: string;
  content: string;
  created_at?: string;
}

async function getPrompts(): Promise<Prompt[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase
    .from("prompts")
    .select("id, title, content, created_at")
    .order("created_at", { ascending: false })
    .limit(3);
  return data || [];
}

export default async function Home() {
  const latestPrompts = await getPrompts();

  return (
    <div className="flex flex-col min-h-screen items-center justify-between p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">
      <header className="w-full flex flex-col items-center gap-4 mt-8">
        <h1 className="text-3xl font-bold tracking-tight">Promptory</h1>
        <p className="text-muted-foreground text-base text-center max-w-md">
          AI 프롬프트를 쉽고 빠르게 관리하고 공유하세요.
        </p>
      </header>
      <main className="flex flex-col items-center gap-8 w-full max-w-md flex-1 justify-center">
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
