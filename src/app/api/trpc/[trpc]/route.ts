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
      const supabaseToken = await getToken({ template: "supabase" });

      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: {
          headers: {
            Authorization: `Bearer ${supabaseToken}`,
          },
        },
      });

      return {
        userId,
        supabase,
      };
    },
  });

export { handler as GET, handler as POST };
