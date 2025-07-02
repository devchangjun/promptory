import { Suspense } from "react";
import { notFound } from "next/navigation";
import CollectionDetail from "./CollectionDetail";

interface CollectionPageProps {
  params: {
    id: string;
  };
}

export default function CollectionPage({ params }: CollectionPageProps) {
  if (!params.id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>컬렉션을 불러오는 중...</div>}>
        <CollectionDetail collectionId={params.id} />
      </Suspense>
    </div>
  );
}
