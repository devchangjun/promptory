import { trpc } from "@/lib/trpc/client";

export function useLikedPrompts(userId: string) {
  const { data, error, isLoading, refetch } = trpc.prompt.getLikedPrompts.useQuery(
    { userId },
    {
      enabled: !!userId,
    }
  );

  return {
    prompts: data,
    isLoading,
    isError: !!error,
    mutate: refetch,
  };
}
