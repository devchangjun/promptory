import { trpc } from "@/lib/trpc/client";

export function useCreatePrompt() {
  return trpc.prompt.createPrompt.useMutation();
}
