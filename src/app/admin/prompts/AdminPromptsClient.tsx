"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@clerk/nextjs";
import { toast } from "sonner";
import { Prompt } from "@/schemas/promptSchema";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc/client";

interface AdminPromptsClientProps {
  prompts: Prompt[];
}

export default function AdminPromptsClient({ prompts: initialPrompts }: AdminPromptsClientProps) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const { session } = useSession();
  const router = useRouter();

  const deleteMutation = trpc.prompt.deletePrompt.useMutation({
    onSuccess: (data) => {
      setPrompts((prevPrompts) => prevPrompts.filter((p) => p.id !== data.id));
      toast.success("프롬프트가 삭제되었습니다.");
    },
    onError: (error) => {
      toast.error(`삭제 중 오류가 발생했습니다: ${error.message}`);
    },
  });

  const handleEdit = (id: string) => {
    router.push(`/prompt/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!session) {
      toast.error("인증되지 않은 사용자입니다.");
      return;
    }
    deleteMutation.mutate({ id });
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="bg-red-500">
                        삭제
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 작업은 되돌릴 수 없습니다. 프롬프트가 영구적으로 삭제됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 text-white" onClick={() => handleDelete(prompt.id)}>
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
