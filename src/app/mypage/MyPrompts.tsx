"use client";

import PromptCard from "../prompt/PromptCard";
import { useMyPrompts } from "@/hooks/useMyPrompts";

interface MyPromptsProps {
  userId: string;
}

export function MyPrompts({ userId }: MyPromptsProps) {
  const { prompts, isLoading } = useMyPrompts(userId);

  if (isLoading) return <div>내가 작성한 프롬프트를 불러오는 중...</div>;
  if (!prompts || prompts.length === 0) return <div>작성한 프롬프트가 없습니다.</div>;

  return (
    <section>
      <h2 className="font-bold text-lg mb-2">내가 작성한 프롬프트</h2>
      <div className="space-y-4">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </section>
  );
}
