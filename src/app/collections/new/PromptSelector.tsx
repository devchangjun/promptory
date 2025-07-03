"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X } from "lucide-react";

interface PromptSelectorProps {
  selectedPrompts: string[];
  onSelect: (promptIds: string[]) => void;
  onClose: () => void;
}

export default function PromptSelector({ selectedPrompts, onSelect, onClose }: PromptSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelected, setTempSelected] = useState<string[]>(selectedPrompts);

  // 프롬프트 목록 조회
  const { data: promptsData, isLoading } = trpc.prompt.getPrompts.useQuery({
    q: searchQuery,
    page: 1,
    pageSize: 50,
  });

  const prompts = promptsData?.prompts || [];

  const handleTogglePrompt = (promptId: string) => {
    setTempSelected((prev) => (prev.includes(promptId) ? prev.filter((id) => id !== promptId) : [...prev, promptId]));
  };

  const handleConfirm = () => {
    onSelect(tempSelected);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
          {/* 헤더 */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">프롬프트 선택</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">컬렉션에 추가할 프롬프트를 선택해주세요. (최대 100개)</p>
          </div>

          {/* 검색 */}
          <div className="p-6 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="프롬프트 제목으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 프롬프트 목록 */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>프롬프트를 불러오는 중...</p>
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {prompts.map((prompt) => (
                  <Card key={prompt.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={tempSelected.includes(prompt.id)}
                        onCheckedChange={() => handleTogglePrompt(prompt.id)}
                        disabled={!tempSelected.includes(prompt.id) && tempSelected.length >= 100}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{prompt.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{prompt.content}</p>
                        {prompt.category && (
                          <span className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs mt-2">
                            {prompt.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="p-6 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">선택된 프롬프트: {tempSelected.length}개 / 100개</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  취소
                </Button>
                <Button onClick={handleConfirm}>선택 완료 ({tempSelected.length}개)</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
