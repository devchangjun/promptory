"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSession } from "@clerk/nextjs";
import { useCreatePrompt } from "@/hooks/useCreatePrompt";

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
}

export default function PromptForm({ categories }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const router = useRouter();
  const { session } = useSession();
  const isLoggedIn = !!session;
  const { createPrompt, isLoading, error } = useCreatePrompt();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 본문을 입력하세요.");
      return;
    }
    if (!isLoggedIn) {
      toast.error("로그인 후 등록할 수 있습니다.");
      return;
    }
    const ok = await createPrompt({
      title,
      content,
      category_id: categoryId || null,
      session,
    });
    if (ok) {
      toast.success("프롬프트가 등록되었습니다.");
      router.push("/prompt");
    } else if (error) {
      toast.error("등록 실패: " + error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
      <textarea
        placeholder="프롬프트 본문을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={6}
        className="rounded-md border border-input bg-background p-3 text-base resize-y min-h-[120px]"
      />
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="rounded-md border border-input bg-background p-2 text-base"
      >
        <option value="">카테고리 선택(선택)</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={isLoading || !isLoggedIn}>
        {isLoggedIn ? (isLoading ? "등록 중..." : "프롬프트 등록") : "로그인 후 등록"}
      </Button>
      {!isLoggedIn && <p className="text-sm text-destructive">로그인한 사용자만 프롬프트를 등록할 수 있습니다.</p>}
    </form>
  );
}
