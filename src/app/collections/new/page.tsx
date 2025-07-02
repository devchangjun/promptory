import { Suspense } from "react";
import CollectionForm from "./CollectionForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCollectionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/collections"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          컬렉션 목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold">새 컬렉션 만들기</h1>
        <p className="text-muted-foreground mt-2">
          프롬프트들을 테마별로 모아서 컬렉션을 만들어보세요. 최대 100개의 프롬프트를 포함할 수 있습니다.
        </p>
      </div>

      <Suspense fallback={<div>로딩 중...</div>}>
        <CollectionForm />
      </Suspense>
    </div>
  );
}
