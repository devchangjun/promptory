"use client";

import PromptList from "@/components/prompt/PromptList";
import { useLikedPrompts } from "@/hooks/useLikedPrompts";
import { useAuth } from "@clerk/nextjs";

export default function MyLikedPrompts() {
  const { userId } = useAuth();
  const { prompts, isLoading, isError } = useLikedPrompts(userId || "");

  if (isError) return <div className="text-red-500">좋아요한 프롬프트를 불러오는 중 에러가 발생했습니다.</div>;

  return <PromptList prompts={prompts || []} isLoading={isLoading} emptyText="아직 좋아요한 프롬프트가 없습니다." />;
}
