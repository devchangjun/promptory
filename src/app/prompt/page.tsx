import { FileText } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

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

async function getAllPrompts(): Promise<Prompt[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase
    .from("prompts")
    .select("id, title, content, user_id, created_at, category_id")
    .order("created_at", { ascending: false });
  return data || [];
}

async function getCategories(): Promise<Category[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.from("categories").select("id, name");
  return data || [];
}

export default async function PromptPage() {
  const [prompts, categories] = await Promise.all([getAllPrompts(), getCategories()]);
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-8">
        <FileText className="size-6" /> 프롬프트 전체 목록
      </h1>
      <div className="flex flex-col gap-4">
        {prompts.length === 0 && <p className="text-muted-foreground">프롬프트가 없습니다.</p>}
        {prompts.map((p) => (
          <div key={p.id} className="p-4 border rounded-lg shadow-sm bg-card">
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
          </div>
        ))}
      </div>
    </div>
  );
}
