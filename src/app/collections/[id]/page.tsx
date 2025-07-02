import { Suspense } from "react";
import { notFound } from "next/navigation";
import CollectionDetail from "./CollectionDetail";

interface CollectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const resolvedParams = await params;

  if (!resolvedParams.id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>컬렉션을 불러오는 중...</div>}>
        <CollectionDetail collectionId={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
