"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MailIcon, UserIcon } from "lucide-react";
import React from "react";

interface UserInfoCardProps {
  email: string;
  nickname: string;
  imageUrl?: string;
}

export function UserInfoCard({ email, nickname, imageUrl }: UserInfoCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="w-16 h-16">
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt="프로필 이미지" />
          ) : (
            <AvatarFallback>
              <UserIcon className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <CardTitle className="text-lg">{nickname}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MailIcon className="w-4 h-4" />
            {email}
          </div>
        </div>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
