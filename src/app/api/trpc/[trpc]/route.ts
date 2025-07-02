import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const authObj = await auth();
      const { userId, getToken } = authObj;

      // 로그인한 사용자의 경우 Supabase 토큰 사용, 아니면 기본 anon key 사용
      let supabaseToken = null;
      if (userId) {
        try {
          supabaseToken = await getToken({ template: "supabase" });
        } catch (error) {
          console.log("Failed to get Supabase token:", error);
        }
      }

      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: {
          headers: supabaseToken ? { Authorization: `Bearer ${supabaseToken}` } : {},
        },
      });

      return {
        userId,
        supabase,
      };
    },
  });

export { handler as GET, handler as POST };
