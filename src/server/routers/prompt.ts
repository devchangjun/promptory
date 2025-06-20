import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "../trpc";
import { Prompt, promptSchema } from "@/schemas/promptSchema";

export const promptRouter = router({
  getMyPrompts: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ input, ctx }) => {
    const { userId } = input;
    const { data, error } = await ctx.supabase
      .from("prompts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Prompt[];
  }),

  getLikedPrompts: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input;
      if (!userId) {
        return [];
      }

      // 1. 내가 좋아요한 prompt_id 조회
      const { data: likes, error: likesError } = await ctx.supabase
        .from("likes")
        .select("prompt_id")
        .eq("user_id", userId);
      if (likesError) throw likesError;
      const promptIds = likes?.map((like: { prompt_id: string }) => like.prompt_id) || [];
      if (promptIds.length === 0) return [];

      // 2. 해당 프롬프트 정보 조회
      const { data: promptsData, error: promptsError } = await ctx.supabase
        .from("prompts")
        .select("*")
        .in("id", promptIds);
      if (promptsError) throw promptsError;

      return promptsData as Prompt[];
    }),

  getPromptById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const { data, error } = await ctx.supabase.from("prompts").select("*, categories(name)").eq("id", id).single();

      if (error) {
        console.error(error);
        return null;
      }
      if (!data) return null;

      try {
        return promptSchema.parse(data);
      } catch (e) {
        console.error("Invalid prompt data from DB:", e);
        return null;
      }
    }),

  createPrompt: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "제목은 필수입니다."),
        content: z.string().min(1, "내용은 필수입니다."),
        category_id: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, content, category_id } = input;
      const { userId } = ctx;

      const { data, error } = await ctx.supabase.from("prompts").insert({
        title,
        content,
        category_id: category_id || null,
        user_id: userId,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }),
});
