"use client";

import { FileText, Bot, Share2, PanelTop, ArrowRight, Layers3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PromptCard from "@/app/prompt/PromptCard";
import { TextScramble } from "@/components/ui/TextScramble";
import { trpc } from "@/lib/trpc/client";
import { PromptListSkeleton } from "@/components/ui/loading";
import { useRealtimePrompts } from "@/hooks/useRealtimePrompts";

// Feature Card Component
const FeatureCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card/50 p-6 rounded-lg border border-border/50 shadow-sm text-center flex flex-col items-center">
    <div className="mb-4 text-primary">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-card-foreground">{title}</h3>
    <p className="text-muted-foreground">{children}</p>
  </div>
);

// Category Badge Component
const CategoryBadge = ({ category, href }: { category: { id: string; name: string }; href: string }) => (
  <Link href={href}>
    <span className="inline-block bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
      #{category.name}
    </span>
  </Link>
);

export default function Home() {
  // 실시간 프롬프트 업데이트 구독 (홈페이지에서는 토스트 비활성화)
  useRealtimePrompts({ enabled: true, showToasts: false });

  // 데이터 Fetching: 카테고리, 최신 프롬프트
  const { data: categories = [], isLoading: isLoadingCategories } = trpc.prompt.getCategories.useQuery();
  const { data: latestPrompts = [], isLoading: isLoadingLatest } = trpc.prompt.getLatestPrompts.useQuery({ limit: 4 });

  return (
    <div className="flex flex-col min-h-screen items-center font-[family-name:var(--font-geist-sans)] bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-background to-blue-950/20 py-20 md:py-32 text-center flex flex-col items-center">
        <div className="container px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
            <TextScramble text="Promptory" className="text-5xl md:text-7xl font-extrabold tracking-tight" />
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mt-4 mb-8">
            AI 프롬프트를 위한 라이브러리. 팀과 함께 최고의 프롬프트를 만들고, 관리하고, 공유하세요.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/prompt">
              <Button size="lg" className="px-8 py-3 text-lg font-semibold cursor-pointer group">
                프롬프트 둘러보기 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/prompt/new">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg font-semibold cursor-pointer">
                프롬프트 만들기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <main className="container flex flex-col items-center gap-24 md:gap-32 w-full flex-1 my-24 md:my-32">
        {/* Features Section */}
        <section className="w-full max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-4">프롬프트 관리, 이제는 똑똑하게</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Promptory는 프롬프트 엔지니어링의 모든 과정을 지원하여, 당신과 팀의 생산성을 극대화합니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon={<Bot size={32} />} title="프롬프트 중앙화">
              팀의 모든 프롬프트를 한 곳에서 체계적으로 관리하고, 언제 어디서든 쉽게 접근하세요.
            </FeatureCard>
            <FeatureCard icon={<Share2 size={32} />} title="손쉬운 공유와 협업">
              잘 만들어진 프롬프트를 팀원들과 공유하고, 함께 발전시켜 최고의 결과물을 만들어보세요.
            </FeatureCard>
            <FeatureCard icon={<Layers3 size={32} />} title="버전 관리 및 최적화">
              프롬프트의 변경 이력을 추적하고, 다양한 버전을 테스트하며 최적의 프롬프트를 찾아보세요.
            </FeatureCard>
          </div>
        </section>

        {/* Categories Section */}
        <section className="w-full">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <PanelTop className="size-6" /> 카테고리 둘러보기
          </h2>
          {isLoadingCategories && <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />}
          {!isLoadingCategories && categories.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <CategoryBadge key={cat.id} category={cat} href={`/prompt?category=${cat.id}`} />
              ))}
            </div>
          )}
        </section>

        {/* Latest Prompts Section */}
        <section className="w-full">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <FileText className="size-6" /> 최신 프롬프트
          </h2>
          {isLoadingLatest && <PromptListSkeleton count={4} />}
          {!isLoadingLatest && latestPrompts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
          {!isLoadingLatest && latestPrompts.length === 0 && (
            <p className="text-muted-foreground text-center py-8">프롬프트가 없습니다.</p>
          )}
        </section>

        {/* Final CTA Section */}
        <section className="w-full bg-primary/10 border border-primary/20 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            당신의 아이디어를 최고의 AI 결과물로 만들어보세요. Promptory가 도와드리겠습니다.
          </p>
          <Link href="/prompt">
            <Button size="lg" className="px-8 py-3 text-lg font-semibold cursor-pointer group">
              모든 프롬프트 보기 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
