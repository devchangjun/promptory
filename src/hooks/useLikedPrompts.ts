import { trpc } from "@/lib/trpc/client";
import { Prompt } from "@/schemas/promptSchema";

export function useLikedPrompts(userId: string): {
  prompts: Prompt[];
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
} {
  const { data, error, isLoading, refetch } = trpc.prompt.getLikedPrompts.useQuery(
    { userId },
    {
      enabled: !!userId,
    }
  );

  return {
    prompts: data || [],
    isLoading,
    isError: !!error,
    mutate: refetch,
  };
}
