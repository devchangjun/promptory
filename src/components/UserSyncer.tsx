"use client";
import { useUser, useSession } from "@clerk/nextjs";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export default function UserSyncer() {
  const { isSignedIn, user } = useUser();
  const { session } = useSession();

  // Clerk 공식 가이드 방식: accessToken 옵션 사용
  function createClerkSupabaseClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      accessToken: async () => session?.getToken() ?? null,
    });
  }

  useEffect(() => {
    if (isSignedIn && user && session) {
      const client = createClerkSupabaseClient();
      (async () => {
        await client.from("users").upsert({
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "",
          name: user.fullName || user.username || undefined,
          avatar_url: user.imageUrl,
          clerk_user_id: user.id,
        });
      })();
    }
  }, [isSignedIn, user, session]);

  return null;
}
