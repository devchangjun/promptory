"use client";

import PromptCard from "../prompt/PromptCard";
import { useLikedPrompts } from "@/hooks/useLikedPrompts";

interface MyLikedPromptsProps {
  userId: string;
}

export function MyLikedPrompts({ userId }: MyLikedPromptsProps) {
  const { prompts, isLoading } = useLikedPrompts(userId);

  if (isLoading) return <div>좋아요한 프롬프트를 불러오는 중...</div>;
  if (!prompts || prompts.length === 0) return <div>좋아요한 프롬프트가 없습니다.</div>;

  return (
    <section>
      <h2 className="font-bold text-lg mb-2">내가 좋아요한 프롬프트</h2>
      <div className="space-y-4">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </section>
  );
}
