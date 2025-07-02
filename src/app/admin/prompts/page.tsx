"use client";

import { useUser } from "@clerk/nextjs";
import AdminPromptsClient from "./AdminPromptsClient";
import { trpc } from "@/lib/trpc/client";
import { TableSkeleton } from "@/components/ui/loading";

export default function AdminPromptsPage() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const {
    data: prompts = [],
    isLoading,
    error,
  } = trpc.prompt.getAllPromptsForAdmin.useQuery(undefined, {
    enabled: isAdmin,
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-xl font-bold mb-2">로그인이 필요합니다</div>
        <p className="text-muted-foreground">이 페이지를 보려면 로그인해주세요.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg
          className="size-10 text-destructive mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-xl font-bold mb-2">403 - 권한 없음</h2>
        <p className="text-muted-foreground">이 페이지에 접근할 권한이 없습니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-xl font-bold mb-2 text-red-500">데이터 로딩 실패</div>
        <p className="text-muted-foreground">프롬프트 목록을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">프롬프트 관리</h1>
        <TableSkeleton rows={10} cols={5} />
      </div>
    );
  }

  return <AdminPromptsClient prompts={prompts} />;
}
