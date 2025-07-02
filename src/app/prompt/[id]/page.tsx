"use client";

import { useParams } from "next/navigation";
import { FileText, Calendar, User } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import PromptContentWithCopy from "./PromptContentWithCopy";
import PromptLikeButton from "./PromptLikeButton";
import EditPromptButton from "./EditPromptButton";
import { trpc } from "@/lib/trpc/client";
import { PromptDetailSkeleton } from "@/components/ui/loading";

export default function PromptDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { userId } = useAuth();

  const { data: prompt, isLoading, error } = trpc.prompt.getPromptById.useQuery({ id }, { enabled: !!id });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PromptDetailSkeleton />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">프롬프트를 찾을 수 없습니다.</p>
            <p className="text-sm text-muted-foreground">삭제되었거나 존재하지 않는 프롬프트입니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const isAuthor = userId === prompt.user_id;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3 leading-tight text-foreground">{prompt.title}</h1>

              {/* 카테고리와 메타 정보 */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {prompt.category && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all">
                    <FileText className="size-3.5 mr-1.5" />
                    {prompt.category}
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <User className="size-4" />
                  <span>{prompt.user_id}</span>
                </div>

                {prompt.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    <span>{new Date(prompt.created_at).toLocaleDateString("ko-KR")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-2 ml-4">
              {userId && <PromptLikeButton promptId={prompt.id} initialLikeCount={prompt.likeCount} />}
              {isAuthor && <EditPromptButton promptId={prompt.id} />}
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-b border-border"></div>
        </div>

        {/* 프롬프트 내용 */}
        <div className="mb-8">
          <PromptContentWithCopy content={prompt.content} />
        </div>
      </div>
    </div>
  );
}
