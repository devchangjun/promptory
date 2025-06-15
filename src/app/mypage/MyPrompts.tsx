"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PromptCard from "../prompt/PromptCard";

interface MyPromptsProps {
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

export function MyPrompts({ userId }: MyPromptsProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPrompts = async () => {
      setLoading(true);
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { data } = await supabase
        .from("prompts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setPrompts(data || []);
      setLoading(false);
    };
    fetchMyPrompts();
  }, [userId]);

  if (loading) return <div>내가 작성한 프롬프트를 불러오는 중...</div>;
  if (prompts.length === 0) return <div>작성한 프롬프트가 없습니다.</div>;

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
