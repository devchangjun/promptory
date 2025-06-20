import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { Prompt } from "@/types/prompt";

export function useLikedPrompts(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(userId ? ["liked-prompts", userId] : null, async ([, userId]) => {
    // 1. 내가 좋아요한 prompt_id 조회
    const { data: likes, error: likesError } = await supabase.from("likes").select("prompt_id").eq("user_id", userId);
    if (likesError) throw likesError;
    const promptIds = likes?.map((like: { prompt_id: string }) => like.prompt_id) || [];
    if (promptIds.length === 0) return [];
    // 2. 해당 프롬프트 정보 조회
    const { data: promptsData, error: promptsError } = await supabase.from("prompts").select("*").in("id", promptIds);
    if (promptsError) throw promptsError;
    return promptsData as Prompt[];
  });
  return {
    prompts: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}
