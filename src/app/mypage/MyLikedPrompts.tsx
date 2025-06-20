"use client";

import PromptCard from "@/app/prompt/PromptCard";
import { useLikedPrompts } from "@/hooks/useLikedPrompts";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function MyLikedPrompts() {
  const { userId } = useAuth();
  const { prompts, isLoading, isError } = useLikedPrompts(userId || "");

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  if (isError) return <div className="text-red-500">좋아요한 프롬프트를 불러오는 중 에러가 발생했습니다.</div>;

  return (
    <div>
      {prompts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">아직 좋아요한 프롬프트가 없습니다.</p>
      )}
    </div>
  );
}
