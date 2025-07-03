"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Eye, Heart, FileText, Edit3, Save, X, Plus, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import PromptCard from "@/app/prompt/PromptCard";
import PromptSelector from "../new/PromptSelector";
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
import { toast } from "sonner";

interface CollectionDetailProps {
  collectionId: string;
}

export default function CollectionDetail({ collectionId }: CollectionDetailProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPromptSelector, setShowPromptSelector] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    category_id: "",
    is_public: true,
  });

  // 컬렉션 상세 정보 조회
  const {
    data: collection,
    isLoading,
    error,
    refetch: refetchCollection,
  } = trpc.collection.getCollectionById.useQuery({
    id: collectionId,
  });

  // 카테고리 목록 조회
  const { data: categories = [] } = trpc.collection.getCollectionCategories.useQuery();

  // 컬렉션 수정 mutation
  const updateCollectionMutation = trpc.collection.updateCollection.useMutation({
    onSuccess: () => {
      toast.success("컬렉션이 수정되었습니다!");
      setIsEditMode(false);
      refetchCollection();
    },
    onError: (error) => {
      toast.error(error.message || "컬렉션 수정에 실패했습니다.");
    },
  });

  // 컬렉션 삭제 mutation
  const deleteCollectionMutation = trpc.collection.deleteCollection.useMutation({
    onSuccess: () => {
      toast.success("컬렉션이 삭제되었습니다!");
      router.push("/collections");
    },
    onError: (error) => {
      toast.error(error.message || "컬렉션 삭제에 실패했습니다.");
    },
  });

  // 프롬프트 추가 mutation
  const addPromptMutation = trpc.collection.addPromptToCollection.useMutation({
    onSuccess: () => {
      toast.success("프롬프트가 추가되었습니다!");
      refetchCollection();
    },
    onError: (error) => {
      toast.error(error.message || "프롬프트 추가에 실패했습니다.");
    },
  });

  // 프롬프트 제거 mutation
  const removePromptMutation = trpc.collection.removePromptFromCollection.useMutation({
    onSuccess: () => {
      toast.success("프롬프트가 제거되었습니다!");
      refetchCollection();
    },
    onError: (error) => {
      toast.error(error.message || "프롬프트 제거에 실패했습니다.");
    },
  });

  // 편집 모드 시작
  const startEdit = () => {
    if (collection) {
      setEditData({
        name: collection.name || "",
        description: collection.description || "",
        category_id: collection.category_id || "",
        is_public: collection.is_public ?? true,
      });
      setIsEditMode(true);
    }
  };

  // 편집 취소
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditData({
      name: "",
      description: "",
      category_id: "",
      is_public: true,
    });
  };

  // 변경사항 저장
  const saveChanges = async () => {
    if (!collection) return;

    await updateCollectionMutation.mutateAsync({
      id: collection.id,
      ...editData,
    });
  };

  // 프롬프트 선택 처리
  const handlePromptSelect = async (promptIds: string[]) => {
    if (!collection) return;

    // 이미 추가된 프롬프트 ID들 추출
    const existingPromptIds = collection.prompts?.map((p: { id: string }) => p.id) || [];

    // 새로 추가할 프롬프트들만 필터링
    const newPromptIds = promptIds.filter((id) => !existingPromptIds.includes(id));

    if (newPromptIds.length === 0) {
      toast.info("선택한 프롬프트들이 이미 컬렉션에 추가되어 있습니다.");
      setShowPromptSelector(false);
      return;
    }

    // 새로운 프롬프트들만 추가
    let addedCount = 0;
    let failedCount = 0;

    for (const promptId of newPromptIds) {
      try {
        await addPromptMutation.mutateAsync({
          collection_id: collectionId,
          prompt_id: promptId,
        });
        addedCount++;
      } catch (error) {
        console.error("Failed to add prompt:", error);
        failedCount++;
      }
    }

    // 결과 메시지
    if (addedCount > 0) {
      toast.success(`${addedCount}개의 프롬프트가 추가되었습니다!`);
    }
    if (failedCount > 0) {
      toast.error(`${failedCount}개의 프롬프트 추가에 실패했습니다.`);
    }

    setShowPromptSelector(false);
  };

  // 프롬프트 제거
  const handleRemovePrompt = async (promptId: string) => {
    await removePromptMutation.mutateAsync({
      collection_id: collectionId,
      prompt_id: promptId,
    });
  };

  // 컬렉션 삭제
  const handleDeleteCollection = async () => {
    await deleteCollectionMutation.mutateAsync({ id: collectionId });
  };

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

  // 권한 확인: 컬렉션 소유자인지 확인
  const isOwner = user?.id === collection.user_id;

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

        {isOwner && (
          <div className="flex gap-2">
            {!isEditMode ? (
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Edit3 className="h-4 w-4 mr-2" />
                편집
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={cancelEdit} disabled={updateCollectionMutation.isPending}>
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
                <Button size="sm" onClick={saveChanges} disabled={updateCollectionMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 컬렉션 헤더 */}
      <div className="space-y-4">
        {isEditMode ? (
          // 편집 모드
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">컬렉션 제목</Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="컬렉션 제목을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="컬렉션 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">카테고리</Label>
                <select
                  id="category"
                  value={editData.category_id}
                  onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="">카테고리 선택</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={editData.is_public}
                  onChange={(e) => setEditData({ ...editData, is_public: e.target.checked })}
                  className="rounded border-input"
                />
                <Label htmlFor="is_public">공개 컬렉션</Label>
              </div>
            </div>
          </Card>
        ) : (
          // 일반 보기 모드
          <div>
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            {collection.description && <p className="text-lg text-muted-foreground mt-2">{collection.description}</p>}
          </div>
        )}

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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">포함된 프롬프트 ({collection.prompts?.length || 0}개)</h2>

          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPromptSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />
                프롬프트 추가
              </Button>

              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      컬렉션 삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        컬렉션 삭제 확인
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{collection.name}&rdquo; 컬렉션을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteCollection}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>

        {!collection.prompts || collection.prompts.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">프롬프트가 없습니다</h3>
            <p className="text-muted-foreground">이 컬렉션에는 아직 프롬프트가 추가되지 않았습니다.</p>
            {isOwner && (
              <Button className="mt-4" onClick={() => setShowPromptSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />첫 번째 프롬프트 추가하기
              </Button>
            )}
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
                <div key={prompt.id} className="relative">
                  <PromptCard prompt={prompt} />
                  {isOwner && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => handleRemovePrompt(prompt.id)}
                      disabled={removePromptMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* 프롬프트 선택 모달 */}
      {showPromptSelector && (
        <PromptSelector
          selectedPrompts={collection.prompts?.map((p: { id: string }) => p.id) || []}
          onSelect={handlePromptSelect}
          onClose={() => setShowPromptSelector(false)}
        />
      )}
    </div>
  );
}
