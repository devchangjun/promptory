"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";

interface EditNicknameProps {
  userId: string;
  currentNickname: string;
}

export function EditNickname({ userId, currentNickname }: EditNicknameProps) {
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(currentNickname);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clerk API로 닉네임 업데이트 (예시)
      // 실제 구현 시 Clerk SDK 또는 fetch로 PATCH 요청 필요
      // await updateClerkUserNickname(userId, nickname);
      setEditing(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setError("닉네임 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{nickname}</span>
        <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
          <PencilIcon className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input value={nickname} onChange={(e) => setNickname(e.target.value)} disabled={loading} className="w-40" />
      <Button size="icon" variant="ghost" onClick={handleSave} disabled={loading}>
        <CheckIcon className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          setEditing(false);
          setNickname(currentNickname);
        }}
        disabled={loading}
      >
        <XIcon className="w-4 h-4" />
      </Button>
      {error && <span className="text-destructive text-xs ml-2">{error}</span>}
    </div>
  );
}
