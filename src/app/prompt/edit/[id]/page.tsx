import EditPromptPageClient from "./EditPromptPageClient";
import { appRouter } from "@/server/routers/_app";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId, getToken } = await auth();

  // 1. 로그인하지 않은 사용자는 접근 불가
  if (!userId) {
    return notFound();
  }

  // 2. 서버 tRPC 클라이언트 생성
  const supabaseToken = await getToken({ template: "supabase" });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${supabaseToken}` } },
  });
  const caller = appRouter.createCaller({ userId, supabase });

  // 3. 프롬프트 정보 가져오기
  const prompt = await caller.prompt.getPromptById({ id });

  // 4. 프롬프트가 없거나 작성자가 아니면 접근 불가
  if (!prompt || prompt.user_id !== userId) {
    return notFound();
  }

  return <EditPromptPageClient id={id} prompt={prompt} />;
}
