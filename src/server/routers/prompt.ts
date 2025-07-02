import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "../trpc";
import { Prompt, promptSchema } from "@/schemas/promptSchema";

export const promptRouter = router({
  // 홈페이지용 최신 프롬프트 조회 (좋아요 수 포함)
  getLatestPrompts: publicProcedure.input(z.object({ limit: z.number().default(3) })).query(async ({ input, ctx }) => {
    const { limit } = input;

    // 1. 최신 프롬프트 조회
    const { data: promptsData, error: promptsError } = await ctx.supabase
      .from("prompts")
      .select("id, title, content, created_at, user_id, category_id")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (promptsError) throw promptsError;
    if (!promptsData || promptsData.length === 0) return [];

    // 2. 카테고리 정보 조회
    const { data: categoriesData } = await ctx.supabase.from("categories").select("id, name");

    // 3. 좋아요 수 조회 (최적화된 쿼리)
    const promptIds = promptsData.map((p) => p.id);
    const { data: likesData } = await ctx.supabase.from("likes").select("prompt_id").in("prompt_id", promptIds);

    // 4. 데이터 조합
    const categoryMap = Object.fromEntries((categoriesData || []).map((c) => [c.id, c.name]));

    const likeCounts = (likesData || []).reduce((acc, like) => {
      acc[like.prompt_id] = (acc[like.prompt_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const promptsWithDetails = promptsData.map((p) => ({
      ...p,
      category: p.category_id ? categoryMap[p.category_id] : undefined,
      likeCount: likeCounts[p.id] || 0,
    }));

    return promptsWithDetails;
  }),

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
        .select("*, categories(name)")
        .in("id", promptIds);
      if (promptsError) throw promptsError;

      const parsedData = z.array(promptSchema).parse(
        promptsData.map((p) => ({
          ...p,
          category: p.categories?.name,
        }))
      );
      return parsedData;
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

  deletePrompt: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const { id } = input;

    // Optional: Check if the user is an admin or the owner of the prompt
    // For now, we'll allow any authenticated user to delete for simplicity,
    // but in a real app, you'd want authorization logic here.
    // For example, fetch the prompt, check `prompt.user_id === userId`

    const { error } = await ctx.supabase.from("prompts").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, id };
  }),
});
