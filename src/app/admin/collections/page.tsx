"use client";

import { useUser } from "@clerk/nextjs";
import { AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import AdminCollectionsClient from "./AdminCollectionsClient";

export default function AdminCollectionsPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin";

  const { data: collections = [], isLoading } = trpc.collection.getAllCollectionsForAdmin.useQuery(undefined, {
    enabled: isAdmin,
  });

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="size-10 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">403 - 권한 없음</h2>
        <p className="text-muted-foreground">이 페이지에 접근할 권한이 없습니다.</p>
      </div>
    );
  }

  // 타입 매핑 - collection_categories가 배열이므로 첫 번째 요소만 사용
  const mappedCollections = collections.map((collection) => ({
    ...collection,
    collection_categories: Array.isArray(collection.collection_categories)
      ? collection.collection_categories[0] || null
      : collection.collection_categories,
  }));

  return <AdminCollectionsClient collections={mappedCollections} />;
}
