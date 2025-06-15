import React from "react";
// ... existing code ...
// 마이페이지 SSR 페이지
export default async function MyPage() {
  // Clerk 세션에서 유저 정보 fetch (SSR)
  // 실제 구현 시 Clerk API 연동 필요
  // const user = await getClerkUser();

  return (
    <main className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      {/* 내 정보 카드 */}
      {/* <UserInfoCard user={user} /> */}
      {/* 닉네임 수정 */}
      {/* <EditNickname user={user} /> */}
      {/* 내가 좋아요한 프롬프트 */}
      {/* <MyLikedPrompts userId={user.id} /> */}
      {/* 내가 작성한 프롬프트 */}
      {/* <MyPrompts userId={user.id} /> */}
      <div className="text-center text-muted-foreground">마이페이지 기능 컴포넌트 자리</div>
    </main>
  );
}
