import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface CreatePromptInput {
  title: string;
  content: string;
  category_id?: string | null;
  session: any; // Clerk 세션
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
        ? require("@supabase/supabase-js").createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { accessToken: async () => session.getToken() ?? null }
          )
        : client;
      const { error } = await sb.from("prompts").insert({
        title,
        content,
        category_id: category_id || null,
      });
      if (error) throw error;
      setSuccess(true);
      return true;
    } catch (e: any) {
      setError(e.message || "등록 실패");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { createPrompt, isLoading, error, success };
}
