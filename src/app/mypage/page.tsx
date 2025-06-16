"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { UserInfoCard } from "./UserInfoCard";
import { EditNickname } from "./EditNickname";
import { MyLikedPrompts } from "./MyLikedPrompts";
import { MyPrompts } from "./MyPrompts";

export default function MyPage() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn || !user) {
    return <div className="text-center py-20">로그인이 필요합니다.</div>;
  }

  return (
    <main className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      <div className="flex justify-end mb-4">
        <SignOutButton>
          <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition">로그아웃</button>
        </SignOutButton>
      </div>
      <UserInfoCard
        email={user.emailAddresses[0]?.emailAddress || ""}
        nickname={user.username || user.firstName || ""}
        imageUrl={user.imageUrl}
      />
      <EditNickname userId={user.id} currentNickname={user.username || user.firstName || ""} />
      <MyLikedPrompts userId={user.id} />
      <MyPrompts userId={user.id} />
    </main>
  );
}
