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
      try {
        const authObj = await auth();
        const { userId, getToken } = authObj;

        // Create Supabase client with proper configuration
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        if (!supabaseUrl || !supabaseAnonKey) {
          console.error("Missing Supabase environment variables");
          throw new Error("서버 설정에 오류가 있습니다.");
        }

        let supabase;

        if (userId) {
          // 로그인한 사용자의 경우 Supabase JWT 토큰 사용
          try {
            const supabaseToken = await getToken({ template: "supabase" });
            if (supabaseToken) {
              supabase = createClient(supabaseUrl, supabaseAnonKey, {
                global: {
                  headers: {
                    Authorization: `Bearer ${supabaseToken}`,
                  },
                },
              });
            } else {
              // 토큰이 없으면 기본 anon 클라이언트 사용
              supabase = createClient(supabaseUrl, supabaseAnonKey);
            }
          } catch (error) {
            console.error("Failed to get Supabase token:", error);
            // 토큰 가져오기 실패시 기본 anon 클라이언트 사용
            supabase = createClient(supabaseUrl, supabaseAnonKey);
          }
        } else {
          // 로그인하지 않은 사용자는 anon 클라이언트 사용
          supabase = createClient(supabaseUrl, supabaseAnonKey);
        }

        return {
          userId,
          supabase,
        };
      } catch (error) {
        console.error("Error creating TRPC context:", error);
        // 에러 발생시에도 기본 클라이언트 반환
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        return {
          userId: null,
          supabase,
        };
      }
    },
  });

export { handler as GET, handler as POST };
