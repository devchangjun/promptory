import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import PromptContentWithCopy from "./PromptContentWithCopy";
import PromptLikeButton from "./PromptLikeButton";
import EditPromptButton from "./EditPromptButton";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { promptSchema, Prompt } from "@/schemas/promptSchema";
import { SupabaseClient } from "@supabase/supabase-js";

async function getPrompt(supabase: SupabaseClient, id: string): Promise<Prompt | null> {
  const { data } = await supabase.from("prompts").select("*, categories(name)").eq("id", id).single();

  if (!data) return null;

  try {
    const promptData = { ...data, category: data.categories?.name };
    return promptSchema.parse(promptData);
  } catch (error) {
    console.error("Invalid prompt data:", error);
    return null;
  }
}

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });

  console.time("프롬프트 상세 페이지 전체 로딩");

  // 1. 사용자 정보 가져오기와 프롬프트 데이터 가져오기를 동시에 시작
  const [authResult, prompt] = await Promise.all([
    (async () => {
      console.time("auth() 실행 시간");
      const result = await auth();
      console.timeEnd("auth() 실행 시간");
      return result;
    })(),
    (async () => {
      console.time("getPrompt() 실행 시간");
      const result = await getPrompt(supabase, id);
      console.timeEnd("getPrompt() 실행 시간");
      return result;
    })(),
  ]);

  // 2. 두 작업이 모두 끝나면 결과 처리
  const { userId } = authResult;

  if (!prompt) {
    return notFound();
  }

  const isAuthor = userId === prompt.user_id;

  console.timeEnd("프롬프트 상세 페이지 전체 로딩");

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <FileText className="size-6" /> {prompt.title}
        {prompt.category && (
          <span className="ml-2 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            {prompt.category}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {userId && <PromptLikeButton promptId={prompt.id} />}
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
