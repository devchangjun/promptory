"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Trash,
  Layers,
  Globe,
  Lock,
  FileText,
  Heart,
} from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  is_public: boolean;
  category_id: string | null;
  view_count: number;
  like_count: number;
  prompt_count: number;
  created_at: string;
  updated_at: string;
  collection_categories: { name: string } | null;
}

interface AdminCollectionsClientProps {
  collections: Collection[];
}

type SortField = "name" | "created_at" | "user_id" | "prompt_count" | "view_count" | "like_count";
type SortDirection = "asc" | "desc";

export default function AdminCollectionsClient({ collections: initialCollections }: AdminCollectionsClientProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const { session } = useSession();
  const router = useRouter();

  // tRPC mutations
  const deleteMutation = trpc.collection.deleteCollectionAsAdmin.useMutation({
    onSuccess: (data) => {
      setCollections((prevCollections) => prevCollections.filter((c) => c.id !== data.id));
      toast.success("컬렉션이 삭제되었습니다.");
    },
    onError: (error) => {
      toast.error(`삭제 중 오류가 발생했습니다: ${error.message}`);
    },
  });

  const updateMutation = trpc.collection.updateCollectionAsAdmin.useMutation({
    onSuccess: () => {
      router.refresh();
      setEditingCollection(null);
      toast.success("컬렉션이 수정되었습니다.");
    },
    onError: (error) => {
      toast.error(`수정 중 오류가 발생했습니다: ${error.message}`);
    },
  });

  // 카테고리 조회
  const { data: categories = [] } = trpc.collection.getCollectionCategories.useQuery();

  // 카테고리 목록 추출
  const categoryOptions = useMemo(() => {
    const categorySet = new Set(collections.map((c) => c.collection_categories?.name).filter(Boolean) as string[]);
    return Array.from(categorySet);
  }, [collections]);

  // 필터링 및 정렬된 컬렉션
  const filteredAndSortedCollections = useMemo(() => {
    const filtered = collections.filter((collection) => {
      const matchesSearch =
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (collection.description && collection.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || collection.collection_categories?.name === selectedCategory;

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "public" && collection.is_public) ||
        (visibilityFilter === "private" && !collection.is_public);

      return matchesSearch && matchesCategory && matchesVisibility;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "user_id":
          aValue = a.user_id;
          bValue = b.user_id;
          break;
        case "prompt_count":
          aValue = a.prompt_count;
          bValue = b.prompt_count;
          break;
        case "view_count":
          aValue = a.view_count;
          bValue = b.view_count;
          break;
        case "like_count":
          aValue = a.like_count;
          bValue = b.like_count;
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [collections, searchTerm, selectedCategory, visibilityFilter, sortField, sortDirection]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredAndSortedCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCollections = filteredAndSortedCollections.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
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

    for (const id of selectedCollections) {
      deleteMutation.mutate({ id });
    }
    setSelectedCollections([]);
  };

  const handleSelectAll = () => {
    if (selectedCollections.length === paginatedCollections.length) {
      setSelectedCollections([]);
    } else {
      setSelectedCollections(paginatedCollections.map((c) => c.id));
    }
  };

  const handleSelectCollection = (id: string) => {
    setSelectedCollections((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
  };

  const handleUpdate = (data: { name: string; description: string; category_id: string; is_public: boolean }) => {
    if (!editingCollection) return;

    updateMutation.mutate({
      id: editingCollection.id,
      ...data,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">컬렉션 관리</h1>
          <p className="text-muted-foreground">총 {filteredAndSortedCollections.length}개의 컬렉션</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/collections/new")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />새 컬렉션
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="컬렉션 제목 또는 설명..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">모든 카테고리</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">공개 설정</Label>
              <select
                id="visibility"
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">모든 컬렉션</option>
                <option value="public">공개</option>
                <option value="private">비공개</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemsPerPage">페이지당 항목</Label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value={10}>10개</option>
                <option value={25}>25개</option>
                <option value={50}>50개</option>
                <option value={100}>100개</option>
              </select>
            </div>
          </div>

          {/* 배치 작업 */}
          {selectedCollections.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedCollections.length}개 선택됨</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex items-center gap-2">
                    <Trash className="h-4 w-4" />
                    선택 삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>컬렉션 삭제 확인</AlertDialogTitle>
                    <AlertDialogDescription>
                      선택된 {selectedCollections.length}개의 컬렉션을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBatchDelete}>삭제</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 테이블 */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={
                    selectedCollections.length === paginatedCollections.length && paginatedCollections.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("name")} className="flex items-center gap-1">
                  제목
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>공개 설정</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("prompt_count")} className="flex items-center gap-1">
                  프롬프트 수
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("view_count")} className="flex items-center gap-1">
                  조회수
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("like_count")} className="flex items-center gap-1">
                  좋아요
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("created_at")} className="flex items-center gap-1">
                  생성일
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("user_id")} className="flex items-center gap-1">
                  작성자
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCollections.map((collection) => (
              <TableRow key={collection.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(collection.id)}
                    onChange={() => handleSelectCollection(collection.id)}
                    className="rounded"
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium line-clamp-1">{collection.name}</div>
                    {collection.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">{collection.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {collection.collection_categories?.name ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                      <Layers className="h-3 w-3" />
                      {collection.collection_categories.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                      collection.is_public
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {collection.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {collection.is_public ? "공개" : "비공개"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    {collection.prompt_count}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    {collection.view_count.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3 w-3 text-muted-foreground" />
                    {collection.like_count.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{new Date(collection.created_at).toLocaleDateString()}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground truncate max-w-[100px]">{collection.user_id}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/collections/${collection.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(collection)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>컬렉션 삭제 확인</AlertDialogTitle>
                          <AlertDialogDescription>
                            &ldquo;{collection.name}&rdquo; 컬렉션을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(collection.id)}>삭제</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {paginatedCollections.length === 0 && (
          <div className="text-center py-10">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">컬렉션이 없습니다</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== "all" || visibilityFilter !== "all"
                ? "검색 조건에 맞는 컬렉션이 없습니다."
                : "아직 생성된 컬렉션이 없습니다."}
            </p>
          </div>
        )}
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedCollections.length)} of{" "}
            {filteredAndSortedCollections.length} 컬렉션
          </p>
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
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
      )}

      {/* 수정 다이얼로그 */}
      <Dialog open={!!editingCollection} onOpenChange={() => setEditingCollection(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>컬렉션 수정</DialogTitle>
            <DialogDescription>컬렉션 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          {editingCollection && (
            <EditCollectionForm
              collection={editingCollection}
              categories={categories}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCollection(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 컬렉션 수정 폼 컴포넌트
interface EditCollectionFormProps {
  collection: Collection;
  categories: { id: string; name: string }[];
  onSubmit: (data: { name: string; description: string; category_id: string; is_public: boolean }) => void;
  onCancel: () => void;
}

function EditCollectionForm({ collection, categories, onSubmit, onCancel }: EditCollectionFormProps) {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || "");
  const [categoryId, setCategoryId] = useState(collection.category_id || "");
  const [isPublic, setIsPublic] = useState(collection.is_public);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      category_id: categoryId,
      is_public: isPublic,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">제목 *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="컬렉션 제목을 입력하세요"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="컬렉션 설명을 입력하세요"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">카테고리</Label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
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
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="is_public">공개 컬렉션으로 설정</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">수정</Button>
      </div>
    </form>
  );
}
