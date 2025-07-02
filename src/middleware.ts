import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 로그인하지 않은 사용자도 접근 가능한 공개 경로
const isPublicRoute = createRouteMatcher([
  "/", // 홈페이지
  "/prompt", // 프롬프트 목록
  "/prompt/(.*)", // 프롬프트 상세보기
  "/api/trpc/(.*)", // tRPC API (여기서 개별적으로 권한 제어)
]);

export default clerkMiddleware(async (auth, req) => {
  // 공개 경로가 아닌 경우에만 인증 필요
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
