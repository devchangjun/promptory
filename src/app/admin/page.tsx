"use client";
import { useUser } from "@clerk/nextjs";
import { AlertTriangle, FileText, Users, Layers } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  disabled?: boolean;
}

function FeatureCard({ title, description, icon, href, disabled }: FeatureCardProps) {
  return (
    <Link href={disabled ? "#" : href} className={disabled ? "cursor-not-allowed" : ""}>
      <Card className={`hover:bg-muted/50 transition-colors ${disabled ? "opacity-50" : ""}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">{icon}</div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <p className="text-muted-foreground mt-1">전체 데이터 및 운영 기능을 관리할 수 있습니다.</p>
        </div>
      </div>

      {/* 기능 카드 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FeatureCard
          title="프롬프트 관리"
          description="사진 관리 및 가격 관리"
          icon={<FileText className="size-5 text-primary" />}
          href="/admin/prompts"
        />
        <FeatureCard
          title="컬렉션 관리"
          description="컬렉션 및 카테고리 관리"
          icon={<Layers className="size-5 text-primary" />}
          href="/admin/collections"
          disabled
        />
        <FeatureCard
          title="유저 관리"
          description="회원 관리 및 권한 설정"
          icon={<Users className="size-5 text-primary" />}
          href="/admin/users"
          disabled
        />
      </div>
    </div>
  );
}
