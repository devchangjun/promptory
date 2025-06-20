import { trpc } from "@/lib/trpc/client";

export function useMyPrompts(userId: string) {
  const { data, error, isLoading, refetch } = trpc.prompt.getMyPrompts.useQuery(
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
