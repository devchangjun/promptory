import React from "react";
import { cn } from "@/lib/utils";

// 기본 스피너 컴포넌트
export function Spinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full", className)}
      role="status"
      aria-label="로딩 중"
      {...props}
    />
  );
}

// 페이지 중앙 로딩
export function PageLoader({ message = "로딩 중..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Spinner className="h-8 w-8 mb-4" />
      <p>{message}</p>
    </div>
  );
}

// 스켈레톤 기본 컴포넌트
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

// 프롬프트 카드 스켈레톤
export function PromptCardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  );
}

// 프롬프트 리스트 스켈레톤
export function PromptListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PromptCardSkeleton key={i} />
      ))}
    </div>
  );
}

// 인라인 로딩 (버튼 등에 사용)
export function InlineLoader({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  return <Spinner className={sizeClasses[size]} />;
}
