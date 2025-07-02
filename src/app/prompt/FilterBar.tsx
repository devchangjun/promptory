"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Spinner } from "@/components/ui/loading";

interface Props {
  defaultCategory?: string;
  defaultQ?: string;
}

export default function FilterBar({ defaultCategory, defaultQ }: Props) {
  const [category, setCategory] = useState(defaultCategory || "");
  const [q, setQ] = useState(defaultQ || "");
  const router = useRouter();

  // tRPC로 카테고리 조회
  const { data: categories = [], isLoading: categoriesLoading } = trpc.prompt.getCategories.useQuery();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    router.push(`/prompt${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end mb-2">
      <div className="relative min-w-[120px]">
        {categoriesLoading ? (
          <div className="flex items-center justify-center h-10 border rounded-md bg-background">
            <Spinner className="h-4 w-4" />
          </div>
        ) : (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-input bg-background p-2 text-base w-full"
          >
            <option value="">전체 카테고리</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <Input type="text" placeholder="제목 검색" value={q} onChange={(e) => setQ(e.target.value)} className="w-48" />
      <Button type="submit" variant="outline" className="gap-1">
        <Search className="size-4" /> 검색
      </Button>
    </form>
  );
}
