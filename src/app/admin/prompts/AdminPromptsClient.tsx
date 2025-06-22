"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@clerk/nextjs";
import { toast } from "sonner";
import { Prompt } from "@/schemas/promptSchema";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminPromptsClientProps {
  prompts: Prompt[];
}

export default function AdminPromptsClient({ prompts: initialPrompts }: AdminPromptsClientProps) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const { session } = useSession();
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/prompt/edit/${id}`);
  };

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
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">프롬프트 관리</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/5">제목</TableHead>
              <TableHead className="w-1/5">작성자 ID</TableHead>
              <TableHead className="w-1/5">생성일</TableHead>
              <TableHead className="text-right w-1/5">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell className="font-medium">{prompt.title}</TableCell>
                <TableCell>{prompt.user_id}</TableCell>
                <TableCell>{prompt.created_at ? new Date(prompt.created_at).toLocaleDateString() : "-"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(prompt.id)}>
                    수정
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(prompt.id)}>
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
