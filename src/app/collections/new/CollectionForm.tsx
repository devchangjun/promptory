"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc/client";
import { createCollectionSchema } from "@/schemas/collectionSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, X, Search } from "lucide-react";
import PromptSelector from "./PromptSelector";

export default function CollectionForm() {
  const router = useRouter();
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [showPromptSelector, setShowPromptSelector] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      is_public: true,
      prompt_ids: [],
    },
  });

  // 카테고리 목록 조회
  const { data: categories = [] } = trpc.collection.getCollectionCategories.useQuery();

  // 컬렉션 생성 mutation
  const createCollectionMutation = trpc.collection.createCollection.useMutation({
    onSuccess: (data) => {
      toast.success("컬렉션이 성공적으로 생성되었습니다!");
      router.push(`/collections/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "컬렉션 생성에 실패했습니다.");
    },
  });

  const onSubmit = async (data: typeof createCollectionSchema._type) => {
    try {
      await createCollectionMutation.mutateAsync({
        ...data,
        prompt_ids: selectedPrompts,
      });
    } catch (error) {
      console.error("Collection creation error:", error);
    }
  };

  const handlePromptSelect = (promptIds: string[]) => {
    setSelectedPrompts(promptIds);
    setShowPromptSelector(false);
  };

  const removePrompt = (promptId: string) => {
    setSelectedPrompts((prev) => prev.filter((id) => id !== promptId));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 기본 정보 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
        <div className="space-y-4">
          {/* 제목 */}
          <div>
            <Label htmlFor="name">컬렉션 제목 *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="예: 브랜딩 프롬프트 모음"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* 설명 */}
          <div>
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="이 컬렉션에 대한 설명을 입력해주세요..."
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* 카테고리 */}
          <div>
            <Label htmlFor="category_id">카테고리</Label>
            <select
              id="category_id"
              {...register("category_id")}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              <option value="">카테고리 선택 (선택사항)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* 공개 설정 */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="is_public" {...register("is_public")} className="rounded border-input" />
            <Label htmlFor="is_public">공개 컬렉션으로 설정</Label>
          </div>
        </div>
      </Card>

      {/* 프롬프트 선택 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">프롬프트 선택</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPromptSelector(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            프롬프트 추가
          </Button>
        </div>

        {selectedPrompts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2" />
            <p>아직 선택된 프롬프트가 없습니다.</p>
            <p className="text-sm">위의 &ldquo;프롬프트 추가&rdquo; 버튼을 클릭해서 프롬프트를 추가해보세요.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">선택된 프롬프트: {selectedPrompts.length}개 (최대 100개)</p>
            <div className="grid gap-2">
              {selectedPrompts.map((promptId, index) => (
                <div key={promptId} className="flex items-center justify-between bg-muted p-3 rounded">
                  <span className="text-sm font-medium">프롬프트 #{index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePrompt(promptId)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 제출 버튼 */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          컬렉션 생성
        </Button>
      </div>

      {/* 프롬프트 선택 모달 */}
      {showPromptSelector && (
        <PromptSelector
          selectedPrompts={selectedPrompts}
          onSelect={handlePromptSelect}
          onClose={() => setShowPromptSelector(false)}
        />
      )}
    </form>
  );
}
