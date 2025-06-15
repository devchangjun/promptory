import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import PromptContentWithCopy from "./PromptContentWithCopy";
import PromptLikeButton from "./PromptLikeButton";

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

async function getPrompt(id: string): Promise<Prompt | null> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase
    .from("prompts")
    .select("id, title, content, user_id, created_at, category_id")
    .eq("id", id)
    .single();
  return data || null;
}

async function getCategoryName(category_id?: string | null): Promise<string | null> {
  if (!category_id) return null;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.from("categories").select("name").eq("id", category_id).single();
  return data?.name || null;
}

interface PageProps {
  params: { id: string };
}

export default async function PromptDetailPage({ params }: PageProps) {
  const prompt = await getPrompt(params.id);
  if (!prompt) return notFound();
  const categoryName = await getCategoryName(prompt.category_id);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <FileText className="size-6" /> {prompt.title}
        {categoryName && (
          <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            {categoryName}
          </span>
        )}
        <span className="ml-2">
          <PromptLikeButton promptId={prompt.id} />
        </span>
      </h1>
      <PromptContentWithCopy content={prompt.content} />
      <div className="flex gap-4 text-xs text-gray-400 mt-6">
        <span>작성자: {prompt.user_id}</span>
        <span>{prompt.created_at?.slice(0, 10)}</span>
      </div>
    </div>
  );
}
