import { notFound } from "next/navigation";
import { FileText, Calendar, User } from "lucide-react";
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
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-3 leading-tight">{prompt.title}</h1>

            {/* 카테고리와 메타 정보 */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {prompt.category && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all">
                  <FileText className="size-3.5 mr-1.5" />
                  {prompt.category}
                </span>
              )}

              <div className="flex items-center gap-1">
                <User className="size-4" />
                <span>{prompt.user_id}</span>
              </div>

              {prompt.created_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  <span>{new Date(prompt.created_at).toLocaleDateString("ko-KR")}</span>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center gap-2 ml-4">
            {userId && <PromptLikeButton promptId={prompt.id} />}
            {isAuthor && <EditPromptButton promptId={prompt.id} />}
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-b border-gray-200 dark:border-gray-700"></div>
      </div>

      {/* 프롬프트 내용 */}
      <div className="mb-8">
        <PromptContentWithCopy content={prompt.content} />
      </div>
    </div>
  );
}
