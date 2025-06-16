"use client";

import { useState } from "react";
import { useSession } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

interface EditNicknameProps {
  userId: string;
  currentNickname: string;
}

export function EditNickname({ userId, currentNickname }: EditNicknameProps) {
  const [nickname, setNickname] = useState(currentNickname);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useSession();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || nickname === currentNickname) return;

    setIsLoading(true);
    try {
      const token = await session?.getToken({ template: "supabase" });
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      });

      // users 테이블에서 현재 사용자 확인
      const { data: existingUser } = await supabase.from("users").select().eq("clerk_id", userId).single();

      if (existingUser) {
        // 기존 사용자 정보 업데이트
        const { error: updateError } = await supabase
          .from("users")
          .update({ nickname, updated_at: new Date().toISOString() })
          .eq("clerk_id", userId);

        if (updateError) throw updateError;
      } else {
        // 새 사용자 정보 생성
        const { error: insertError } = await supabase.from("users").insert({ clerk_id: userId, nickname });

        if (insertError) throw insertError;
      }

      toast.success("닉네임이 성공적으로 변경되었습니다.");
    } catch (error) {
      console.error("닉네임 변경 중 오류 발생:", error);
      toast.error("닉네임 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">닉네임 변경</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="새로운 닉네임"
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !nickname.trim() || nickname === currentNickname}>
          {isLoading ? "변경 중..." : "변경"}
        </Button>
      </form>
    </div>
  );
}
