import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CreatePromptInput {
  title: string;
  content: string;
  category_id?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any | null;
}

export function useCreatePrompt() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function createPrompt({ title, content, category_id, session }: CreatePromptInput) {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const client = supabase;
      // 인증 토큰 필요시 클라이언트 재생성
      const sb = session
        ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: `Bearer ${await session.getToken({ template: "supabase" })}` } },
          })
        : client;
      const { error } = await sb.from("prompts").insert({
        title,
        content,
        category_id: category_id || null,
      });
      if (error) throw error;
      setSuccess(true);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "등록 실패");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { createPrompt, isLoading, error, success };
}
