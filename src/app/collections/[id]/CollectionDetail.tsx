"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Eye, Heart, FileText, Settings } from "lucide-react";
import Link from "next/link";
import PromptCard from "@/app/prompt/PromptCard";

interface CollectionDetailProps {
  collectionId: string;
}

export default function CollectionDetail({ collectionId }: CollectionDetailProps) {
  // 컬렉션 상세 정보 조회
  const {
    data: collection,
    isLoading,
    error,
  } = trpc.collection.getCollectionById.useQuery({
    id: collectionId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">컬렉션을 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-4">요청하신 컬렉션이 존재하지 않거나 삭제되었습니다.</p>
        <Link href="/collections">
          <Button>컬렉션 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 뒤로가기 및 액션 버튼 */}
      <div className="flex items-center justify-between">
        <Link
          href="/collections"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          컬렉션 목록으로 돌아가기
        </Link>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          관리
        </Button>
      </div>

      {/* 컬렉션 헤더 */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{collection.name}</h1>
          {collection.description && <p className="text-lg text-muted-foreground mt-2">{collection.description}</p>}
        </div>

        {/* 메타 정보 */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          {collection.category && (
            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full">{collection.category}</span>
          )}
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {collection.prompt_count}개 프롬프트
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {collection.view_count} 조회
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {collection.like_count} 좋아요
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            작성자
          </div>
          <span>{new Date(collection.created_at || "").toLocaleDateString()}</span>
        </div>
      </div>

      {/* 프롬프트 목록 */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">포함된 프롬프트 ({collection.prompts?.length || 0}개)</h2>

        {!collection.prompts || collection.prompts.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">프롬프트가 없습니다</h3>
            <p className="text-muted-foreground">이 컬렉션에는 아직 프롬프트가 추가되지 않았습니다.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.prompts.map(
              (prompt: {
                id: string;
                title: string;
                content: string;
                user_id: string;
                category: string | null;
                likeCount: number;
              }) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
