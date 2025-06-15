"use client";
import { useUser } from "@clerk/nextjs";
import { AlertTriangle, FileText, Users, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin";

  if (!isLoaded) {
    return <div className="py-20 text-center">로딩 중...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="size-10 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">403 - 권한 없음</h2>
        <p className="text-muted-foreground">이 페이지에 접근할 권한이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">관리자 페이지</h1>
      <div className="flex gap-3 mb-8">
        <Link href="/admin/prompts">
          <Button variant="outline" className="gap-2">
            <FileText className="size-4" /> 프롬프트 관리
          </Button>
        </Link>
        <Button variant="outline" className="gap-2" disabled>
          <Layers className="size-4" /> 컬렉션 관리
        </Button>
        <Button variant="outline" className="gap-2" disabled>
          <Users className="size-4" /> 유저 관리
        </Button>
      </div>
      <p className="mb-4 text-muted-foreground">이곳에서 전체 데이터 및 운영 기능을 관리할 수 있습니다.</p>
      <div className="p-6 rounded bg-muted text-foreground border">
        <p>관리자 권한이 확인되었습니다. 앞으로 이곳에 관리 기능이 추가됩니다.</p>
      </div>
    </div>
  );
}
