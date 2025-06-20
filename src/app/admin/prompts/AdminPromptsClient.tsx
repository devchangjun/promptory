"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@clerk/nextjs";
import { toast } from "sonner";
import { Prompt } from "@/schemas/promptSchema";

interface AdminPromptsClientProps {
  prompts: Prompt[];
}

export default function AdminPromptsClient({ prompts: initialPrompts }: AdminPromptsClientProps) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const { session } = useSession();

  const handleDelete = async (id: string) => {
    if (!session) {
      toast.error("인증되지 않은 사용자입니다.");
      return;
    }
    // 여기에 실제 삭제 로직을 구현해야 합니다. (예: tRPC 호출)
    // 지금은 클라이언트 측에서만 삭제합니다.
    setPrompts(prompts.filter((p) => p.id !== id));
    toast.success("프롬프트가 삭제되었습니다.");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">프롬프트 관리</h1>
      <div>
        {prompts.map((prompt) => (
          <div key={prompt.id} className="flex items-center gap-4 border-b p-2">
            <span className="flex-1 font-semibold">{prompt.title}</span>
            <span className="flex-1 text-sm text-gray-500">{prompt.user_id}</span>
            <span className="text-xs text-gray-400">{prompt.created_at?.slice(0, 10)}</span>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(prompt.id)}>
              삭제
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
