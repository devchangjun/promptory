"use client";

import { FileText } from "lucide-react";
import PromptForm from "./PromptForm";
import { trpc } from "@/lib/trpc/client";
import { FormSkeleton } from "@/components/ui/loading";

export default function PromptNewPage() {
  const { data: categories = [], isLoading, error } = trpc.prompt.getCategories.useQuery();

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">카테고리를 불러오는데 실패했습니다.</p>
          <p className="text-sm text-muted-foreground">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-8">
        <FileText className="size-6" /> 프롬프트 작성
      </h1>

      {isLoading ? <FormSkeleton /> : <PromptForm categories={categories} />}
    </div>
  );
}
