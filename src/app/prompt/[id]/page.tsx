import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import PromptContentWithCopy from "./PromptContentWithCopy";
import PromptLikeButton from "./PromptLikeButton";
import EditPromptButton from "./EditPromptButton";
import { Prompt, promptSchema } from "@/schemas/promptSchema";

async function getPrompt(id: string): Promise<Prompt | null> {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from("prompts").select("*, categories(name)").eq("id", id).single();

  if (!data) return null;

  try {
    return promptSchema.parse(data);
  } catch (error) {
    console.error("Invalid prompt data:", error);
    return null;
  }
}

export default async function PromptDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [{ userId }, prompt] = await Promise.all([auth(), getPrompt(id)]);

  if (!prompt) return notFound();

  const categoryName = prompt.categories?.name;
  const isAuthor = userId === prompt.user_id;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <FileText className="size-6" /> {prompt.title}
        {categoryName && (
          <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            {categoryName}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <PromptLikeButton promptId={prompt.id} />
          {isAuthor && <EditPromptButton promptId={prompt.id} />}
        </div>
      </h1>
      <PromptContentWithCopy content={prompt.content} />
      <div className="flex gap-4 text-xs text-gray-400 mt-6">
        <span>작성자: {prompt.user_id}</span>
        <span>{prompt.created_at?.slice(0, 10)}</span>
      </div>
    </div>
  );
}
