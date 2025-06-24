"use client";

import PromptList from "@/components/prompt/PromptList";
import { useMyPrompts } from "@/hooks/useMyPrompts";

interface MyPromptsProps {
  userId: string;
}

export function MyPrompts({ userId }: MyPromptsProps) {
  const { prompts, isLoading } = useMyPrompts(userId);

  return <PromptList prompts={prompts || []} isLoading={isLoading} emptyText="작성한 프롬프트가 없습니다." />;
}
