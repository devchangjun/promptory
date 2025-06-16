import useSWR from "swr";
import { supabase } from "@/lib/supabase";

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  created_at: string;
}

export function useMyPrompts(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(userId ? ["my-prompts", userId] : null, async ([, userId]) => {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Prompt[];
  });

  console.log("가지고오기");
  console.log("data", data);
  console.log("가지고오기 끝");

  return {
    prompts: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}
