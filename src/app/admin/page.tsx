"use client";
import { useUser } from "@clerk/nextjs";
import { AlertTriangle, FileText, Users, Layers, TrendingUp, Activity, Plus, Eye, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc/client";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

function StatsCard({ title, value, change, icon, trend = "neutral" }: StatsCardProps) {
  const trendColor = {
    up: "text-foreground dark:text-foreground",
    down: "text-muted-foreground dark:text-muted-foreground",
    neutral: "text-muted-foreground",
  }[trend];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${trendColor} flex items-center gap-1`}>
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  disabled?: boolean;
  count?: number;
}

function FeatureCard({ title, description, icon, href, disabled, count }: FeatureCardProps) {
  return (
    <Link href={disabled ? "#" : href} className={disabled ? "cursor-not-allowed" : ""}>
      <Card className={`hover:bg-muted/50 transition-colors ${disabled ? "opacity-50" : ""}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center size-12 rounded-full bg-muted/50">{icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{title}</h3>
              {count !== undefined && <div className="text-sm text-muted-foreground">{count}개 항목</div>}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function RecentActivityCard() {
  const { data: recentPrompts = [], isLoading } = trpc.prompt.getAllPromptsForAdmin.useQuery(undefined, {
    enabled: true,
  });

  const recent5 = recentPrompts.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          최근 활동
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recent5.length > 0 ? (
          recent5.map((prompt) => (
            <div key={prompt.id} className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{prompt.title}</p>
                <p className="text-xs text-muted-foreground">
                  {prompt.created_at ? new Date(prompt.created_at).toLocaleDateString() : "날짜 없음"}
                </p>
              </div>
              <Link href={`/prompt/${prompt.id}`}>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">최근 활동이 없습니다</p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>빠른 액션</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/prompt/new">
          <Button className="w-full justify-start" variant="outline">
            <Plus className="h-4 w-4 mr-2" />새 프롬프트 생성
          </Button>
        </Link>
        <Link href="/admin/prompts">
          <Button className="w-full justify-start" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            프롬프트 관리
          </Button>
        </Link>
        <Link href="/admin/collections">
          <Button className="w-full justify-start" variant="outline">
            <Layers className="h-4 w-4 mr-2" />
            컬렉션 관리
          </Button>
        </Link>
        <Button className="w-full justify-start" variant="outline" disabled>
          <BarChart3 className="h-4 w-4 mr-2" />
          통계 보고서
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin";

  const { data: prompts = [] } = trpc.prompt.getAllPromptsForAdmin.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: collections = [] } = trpc.collection.getAllCollectionsForAdmin.useQuery(undefined, {
    enabled: isAdmin,
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="size-10 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">403 - 권한 없음</h2>
        <p className="text-muted-foreground">이 페이지에 접근할 권한이 없습니다.</p>
      </div>
    );
  }

  const totalPrompts = prompts.length;
  const todayPrompts = prompts.filter(
    (p) => p.created_at && new Date(p.created_at).toDateString() === new Date().toDateString()
  ).length;

  const totalCollections = collections.length;
  const todayCollections = collections.filter(
    (c) => c.created_at && new Date(c.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <p className="text-muted-foreground mt-1">전체 데이터 및 운영 기능을 관리할 수 있습니다.</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="prompts">프롬프트</TabsTrigger>
          <TabsTrigger value="users" disabled>
            사용자
          </TabsTrigger>
          <TabsTrigger value="settings" disabled>
            설정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="총 프롬프트"
              value={totalPrompts}
              icon={<FileText className="h-4 w-4" />}
              change={`+${todayPrompts} 오늘`}
              trend={todayPrompts > 0 ? "up" : "neutral"}
            />
            <StatsCard
              title="활성 사용자"
              value="145"
              icon={<Users className="h-4 w-4" />}
              change="+12% 지난 주 대비"
              trend="up"
            />
            <StatsCard
              title="컬렉션"
              value={totalCollections}
              icon={<Layers className="h-4 w-4" />}
              change={`+${todayCollections} 오늘`}
              trend={todayCollections > 0 ? "up" : "neutral"}
            />
            <StatsCard
              title="이번 달 조회"
              value="2.4K"
              icon={<Eye className="h-4 w-4" />}
              change="+18% 지난 달 대비"
              trend="up"
            />
          </div>

          {/* 메인 콘텐츠 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 기능 카드 섹션 */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold">관리 도구</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureCard
                  title="프롬프트 관리"
                  description="프롬프트 생성, 수정, 삭제 및 카테고리 관리"
                  icon={<FileText className="size-6 text-muted-foreground" />}
                  href="/admin/prompts"
                  count={totalPrompts}
                />
                <FeatureCard
                  title="컬렉션 관리"
                  description="컬렉션 및 카테고리 관리"
                  icon={<Layers className="size-6 text-muted-foreground" />}
                  href="/admin/collections"
                  count={totalCollections}
                />
                <FeatureCard
                  title="유저 관리"
                  description="회원 관리 및 권한 설정"
                  icon={<Users className="size-6 text-muted-foreground" />}
                  href="/admin/users"
                  disabled
                />
                <FeatureCard
                  title="통계 분석"
                  description="사이트 이용 통계 및 인사이트"
                  icon={<BarChart3 className="size-6 text-muted-foreground" />}
                  href="/admin/analytics"
                  disabled
                />
              </div>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              <RecentActivityCard />
              <QuickActionsCard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prompts">
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">프롬프트 관리 페이지로 이동합니다.</p>
            <Link href="/admin/prompts">
              <Button>프롬프트 관리로 이동</Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="text-center py-10">
            <p className="text-muted-foreground">사용자 관리 기능은 개발 중입니다.</p>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-10">
            <p className="text-muted-foreground">설정 페이지는 개발 중입니다.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
