import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import PromptContentWithCopy from "./PromptContentWithCopy";
import PromptLikeButton from "./PromptLikeButton";
import EditPromptButton from "./EditPromptButton";
import { appRouter } from "@/server/routers/_app";
import { createClient } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId, getToken } = await auth();

  let supabase: SupabaseClient;

  // 로그인 상태에 따라 Supabase 클라이언트 분기
  if (userId) {
    const supabaseToken = await getToken({ template: "supabase" });
    supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${supabaseToken}` } },
    });
  } else {
    // 비로그인 사용자는 anon 키만 사용
    supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }

  // Create a caller for server-side tRPC
  const caller = appRouter.createCaller({
    userId,
    supabase,
  });

  const prompt = await caller.prompt.getPromptById({ id });

  if (!prompt) {
    return notFound();
  }

  const categoryName = prompt.category;
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
