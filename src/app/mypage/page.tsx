"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { UserInfoCard } from "./UserInfoCard";
import { EditNickname } from "./EditNickname";
import MyLikedPrompts from "./MyLikedPrompts";
import { MyPrompts } from "./MyPrompts";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function MyPage() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-3xl font-bold">마이페이지</h1>
        <SignOutButton>
          <Button variant="outline" className="gap-2">
            <LogOut className="size-4" /> 로그아웃
          </Button>
        </SignOutButton>
      </div>
      <UserInfoCard
        email={user.emailAddresses[0]?.emailAddress || ""}
        nickname={user.username || ""}
        imageUrl={user.imageUrl}
      />
      <EditNickname userId={user.id} currentNickname={user.username || ""} />
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">내 활동</h2>
        <Tabs defaultValue="my-prompts" className="w-full">
          <TabsList>
            <TabsTrigger value="my-prompts">내가 작성한 프롬프트</TabsTrigger>
            <TabsTrigger value="liked-prompts">내가 좋아요한 프롬프트</TabsTrigger>
          </TabsList>
          <TabsContent value="my-prompts">
            <MyPrompts userId={user.id} />
          </TabsContent>
          <TabsContent value="liked-prompts">
            <MyLikedPrompts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
