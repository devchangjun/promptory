import { initTRPC, TRPCError } from "@trpc/server";
import { SupabaseClient } from "@supabase/supabase-js";

const t = initTRPC.context<{ userId: string | null; supabase: SupabaseClient }>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
