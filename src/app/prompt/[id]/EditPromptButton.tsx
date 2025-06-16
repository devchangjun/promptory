"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditPromptButtonProps {
  promptId: string;
}

export default function EditPromptButton({ promptId }: EditPromptButtonProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/prompt/edit/${promptId}`);
  };

  return (
    <Button onClick={handleEdit} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
      <Pencil className="size-4 mr-1" />
      수정
    </Button>
  );
}
