"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PromptCard from "../prompt/PromptCard";

interface MyLikedPromptsProps {
  userId: string;
}

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  created_at: string;
}

export function MyLikedPrompts({ userId }: MyLikedPromptsProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPrompts = async () => {
      setLoading(true);
      // Supabase 클라이언트 생성 (환경변수 사용)
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      // 1. 내가 좋아요한 prompt_id 조회
      const { data: likes } = await supabase.from("likes").select("prompt_id").eq("user_id", userId);
      const promptIds = likes?.map((like) => like.prompt_id) || [];
      if (promptIds.length === 0) {
        setPrompts([]);
        setLoading(false);
        return;
      }
      // 2. 해당 프롬프트 정보 조회
      const { data: promptsData } = await supabase.from("prompts").select("*").in("id", promptIds);
      setPrompts(promptsData || []);
      setLoading(false);
    };
    fetchLikedPrompts();
  }, [userId]);

  if (loading) return <div>좋아요한 프롬프트를 불러오는 중...</div>;
  if (prompts.length === 0) return <div>좋아요한 프롬프트가 없습니다.</div>;

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
