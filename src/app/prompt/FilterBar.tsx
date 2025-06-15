"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  defaultCategory?: string;
  defaultQ?: string;
}

export default function FilterBar({ categories, defaultCategory, defaultQ }: Props) {
  const [category, setCategory] = useState(defaultCategory || "");
  const [q, setQ] = useState(defaultQ || "");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    router.push(`/prompt${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end mb-2">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-md border border-input bg-background p-2 text-base min-w-[120px]"
      >
        <option value="">전체 카테고리</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <Input type="text" placeholder="제목 검색" value={q} onChange={(e) => setQ(e.target.value)} className="w-48" />
      <Button type="submit" variant="outline" className="gap-1">
        <Search className="size-4" /> 검색
      </Button>
    </form>
  );
}
