import { currentUser } from "@clerk/nextjs/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Prompt } from "@/schemas/promptSchema";
import AdminPromptsClient from "./AdminPromptsClient";

export default async function AdminPromptsPage() {
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg
          className="size-10 text-destructive mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-xl font-bold mb-2">403 - 권한 없음</h2>
        <p className="text-muted-foreground">이 페이지에 접근할 권한이 없습니다.</p>
      </div>
    );
  }

  // Supabase 클라이언트 생성 (서비스 키 사용 권장, 여기선 anon key)
  const supabase = createServerComponentClient({ cookies });

  const { data } = await supabase.from("prompts").select("id, title, content, user_id, created_at");

  const prompts = (data as Prompt[]) || [];

  return <AdminPromptsClient prompts={prompts} />;
}
