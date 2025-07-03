import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CollectionList from "./CollectionList";

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">프롬프트 컬렉션</h1>
          <p className="text-muted-foreground mt-2">테마별로 정리된 프롬프트 컬렉션을 둘러보세요</p>
        </div>
        <Link href="/collections/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />새 컬렉션 만들기
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>컬렉션을 불러오는 중...</div>}>
        <CollectionList />
      </Suspense>
    </div>
  );
}
