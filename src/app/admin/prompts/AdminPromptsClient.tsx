"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@clerk/nextjs";
import { toast } from "sonner";
import { Prompt } from "@/schemas/promptSchema";
import { useRouter } from "next/navigation";
import { useRealtimePrompts } from "@/hooks/useRealtimePrompts";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  User,
  Trash,
} from "lucide-react";

interface AdminPromptsClientProps {
  prompts: Prompt[];
}

type SortField = "title" | "created_at" | "user_id";
type SortDirection = "asc" | "desc";

export default function AdminPromptsClient({ prompts: initialPrompts }: AdminPromptsClientProps) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { session } = useSession();
  const router = useRouter();

  // 관리자용 실시간 업데이트 구독
  useRealtimePrompts({
    enabled: true,
    showToasts: true, // 관리자는 모든 알림 표시
  });

  const deleteMutation = trpc.prompt.deletePrompt.useMutation({
    onSuccess: (data) => {
      setPrompts((prevPrompts) => prevPrompts.filter((p) => p.id !== data.id));
      toast.success("프롬프트가 삭제되었습니다.");
    },
    onError: (error) => {
      toast.error(`삭제 중 오류가 발생했습니다: ${error.message}`);
    },
  });

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    const categorySet = new Set(prompts.map((p) => p.category).filter(Boolean) as string[]);
    return Array.from(categorySet);
  }, [prompts]);

  // 필터링 및 정렬된 프롬프트
  const filteredAndSortedPrompts = useMemo(() => {
    const filtered = prompts.filter((prompt) => {
      const matchesSearch =
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "user_id":
          aValue = a.user_id;
          bValue = b.user_id;
          break;
        case "created_at":
          aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
          bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [prompts, searchTerm, selectedCategory, sortField, sortDirection]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredAndSortedPrompts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrompts = filteredAndSortedPrompts.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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

  const handleBatchDelete = async () => {
    if (!session) {
      toast.error("인증되지 않은 사용자입니다.");
      return;
    }

    for (const id of selectedPrompts) {
      deleteMutation.mutate({ id });
    }
    setSelectedPrompts([]);
  };

  const handleSelectAll = () => {
    if (selectedPrompts.length === paginatedPrompts.length) {
      setSelectedPrompts([]);
    } else {
      setSelectedPrompts(paginatedPrompts.map((p) => p.id));
    }
  };

  const handleSelectPrompt = (id: string) => {
    setSelectedPrompts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">프롬프트 관리</h1>
          <p className="text-muted-foreground">총 {filteredAndSortedPrompts.length}개의 프롬프트</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/prompt/new")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />새 프롬프트
          </Button>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="제목이나 내용으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">모든 카테고리</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:w-32">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value={10}>10개씩</option>
                <option value={25}>25개씩</option>
                <option value={50}>50개씩</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 배치 작업 */}
      {selectedPrompts.length > 0 && (
        <Card className="border-muted bg-muted/20 dark:bg-muted/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{selectedPrompts.length}개 프롬프트 선택됨</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="h-4 w-4 mr-2" />
                      일괄 삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>선택된 프롬프트를 삭제하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {selectedPrompts.length}개의 프롬프트가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBatchDelete} className="bg-foreground text-background">
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" size="sm" onClick={() => setSelectedPrompts([])}>
                  선택 해제
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 테이블 */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={selectedPrompts.length === paginatedPrompts.length && paginatedPrompts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead className="w-2/5">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("title")}
                      className="h-auto p-0 font-semibold flex items-center gap-1"
                    >
                      제목
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-1/6">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("user_id")}
                      className="h-auto p-0 font-semibold flex items-center gap-1"
                    >
                      작성자
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-1/6">카테고리</TableHead>
                  <TableHead className="w-1/6">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("created_at")}
                      className="h-auto p-0 font-semibold flex items-center gap-1"
                    >
                      생성일
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right w-1/6">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPrompts.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedPrompts.includes(prompt.id)}
                        onChange={() => handleSelectPrompt(prompt.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="max-w-xs truncate">{prompt.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{prompt.user_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {prompt.category && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted/50 text-muted-foreground">
                          {prompt.category}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {prompt.created_at ? new Date(prompt.created_at).toLocaleDateString() : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{prompt.title}</DialogTitle>
                              <DialogDescription>
                                작성자: {prompt.user_id} | 생성일:{" "}
                                {prompt.created_at ? new Date(prompt.created_at).toLocaleDateString() : "-"}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">카테고리</h4>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted/50 text-muted-foreground">
                                  {prompt.category || "미분류"}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">내용</h4>
                                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">{prompt.content}</div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm" onClick={() => handleEdit(prompt.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                              <AlertDialogDescription>
                                &apos;{prompt.title}&apos; 프롬프트가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수
                                없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(prompt.id)}
                                className="bg-foreground text-background"
                              >
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedPrompts.length)} of{" "}
                {filteredAndSortedPrompts.length} 항목
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum =
                      currentPage <= 3
                        ? i + 1
                        : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;

                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
