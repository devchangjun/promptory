import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "../trpc";
import { Prompt, promptSchema } from "@/schemas/promptSchema";

export const promptRouter = router({
  // 카테고리 목록 조회
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.from("categories").select("id, name").order("name");

    if (error) throw error;
    return data || [];
  }),

  // 프롬프트 상세 조회 (좋아요 수 포함)
  getPromptById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const { id } = input;

    // 1. 프롬프트 데이터 조회
    const { data: promptData, error: promptError } = await ctx.supabase
      .from("prompts")
      .select("id, title, content, created_at, user_id, category_id")
      .eq("id", id)
      .single();

    if (promptError) throw promptError;
    if (!promptData) return null;

    // 2. 카테고리 정보 조회
    let categoryName = undefined;
    if (promptData.category_id) {
      const { data: categoryData } = await ctx.supabase
        .from("categories")
        .select("name")
        .eq("id", promptData.category_id)
        .single();
      categoryName = categoryData?.name;
    }

    // 3. 좋아요 수 조회
    const { data: likesData } = await ctx.supabase.from("likes").select("id").eq("prompt_id", id);

    return {
      ...promptData,
      category: categoryName,
      likeCount: likesData?.length || 0,
    };
  }),

  // 관리자용 프롬프트 목록 조회
  getAllPromptsForAdmin: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("prompts")
      .select("id, title, content, user_id, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }),

  // 프롬프트 목록 조회 (필터링, 페이지네이션 지원)
  getPrompts: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        q: z.string().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(12),
      })
    )
    .query(async ({ input, ctx }) => {
      const { category, q, page, pageSize } = input;

      // 1. 프롬프트 조회 쿼리 구성
      let query = ctx.supabase
        .from("prompts")
        .select("id, title, content, created_at, user_id, category_id", { count: "exact" })
        .order("created_at", { ascending: false });

      // 필터링 조건 적용
      if (category) query = query.eq("category_id", category);
      if (q) query = query.ilike("title", `%${q}%`);

      // 페이지네이션 적용
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: promptsData, count, error: promptsError } = await query;

      if (promptsError) throw promptsError;
      if (!promptsData || promptsData.length === 0) {
        return { prompts: [], total: count || 0, totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)) };
      }

      // 2. 카테고리 정보 조회
      const { data: categoriesData } = await ctx.supabase.from("categories").select("id, name");

      // 3. 좋아요 수 조회
      const promptIds = promptsData.map((p) => p.id);
      const { data: likesData } = await ctx.supabase.from("likes").select("prompt_id").in("prompt_id", promptIds);

      // 4. 데이터 조합
      const categoryMap = Object.fromEntries((categoriesData || []).map((c) => [c.id, c.name]));

      const likeCounts = (likesData || []).reduce((acc, like) => {
        acc[like.prompt_id] = (acc[like.prompt_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const prompts = promptsData.map((p) => ({
        ...p,
        category: p.category_id ? categoryMap[p.category_id] : undefined,
        likeCount: likeCounts[p.id] || 0,
      }));

      return {
        prompts,
        total: count || 0,
        totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)),
      };
    }),

  // 홈페이지용 인기 프롬프트 조회 (좋아요 순)
  getPopularPrompts: publicProcedure
    .input(
      z.object({
        limit: z.number().default(5),
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit } = input;

      // 1. 좋아요가 많은 순으로 프롬프트 ID 조회
      const { data: likesCountData, error: likesCountError } = await ctx.supabase.rpc("get_popular_prompt_ids", {
        p_limit: limit,
      });

      if (likesCountError) throw likesCountError;
      if (!likesCountData || likesCountData.length === 0) return [];

      const promptIds = likesCountData.map((p: { prompt_id: string }) => p.prompt_id);

      // 2. 해당 프롬프트 정보 조회
      const { data: promptsData, error: promptsError } = await ctx.supabase
        .from("prompts")
        .select("id, title, content, created_at, user_id, category_id")
        .in("id", promptIds);

      if (promptsError) throw promptsError;

      // 3. 카테고리 정보 조회
      const { data: categoriesData } = await ctx.supabase.from("categories").select("id, name");
      const categoryMap = Object.fromEntries((categoriesData || []).map((c) => [c.id, c.name]));

      // 4. 좋아요 수 조회 (프롬프트 ID 기준)
      const { data: likesData } = await ctx.supabase.from("likes").select("prompt_id").in("id", promptIds);
      const likeCounts = (likesData || []).reduce((acc, like) => {
        acc[like.prompt_id] = (acc[like.prompt_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 5. 데이터 조합 및 정렬
      const promptsWithDetails = promptsData
        .map((p) => ({
          ...p,
          category: p.category_id ? categoryMap[p.category_id] : undefined,
          likeCount: likeCounts[p.id] || 0,
        }))
        // Supabase `in` filter does not guarantee order, so we re-order here
        .sort((a, b) => promptIds.indexOf(a.id) - promptIds.indexOf(b.id));

      return promptsWithDetails;
    }),

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

  // 좋아요 상태 조회
  getLikeStatus: protectedProcedure.input(z.object({ promptId: z.string() })).query(async ({ ctx, input }) => {
    const { promptId } = input;
    const { userId } = ctx;

    // 1. 현재 사용자의 좋아요 여부 확인
    const { data: userLike } = await ctx.supabase
      .from("likes")
      .select("id")
      .eq("prompt_id", promptId)
      .eq("user_id", userId)
      .single();

    // 2. 전체 좋아요 수 조회
    const { data: allLikes } = await ctx.supabase.from("likes").select("id").eq("prompt_id", promptId);

    return {
      isLiked: !!userLike,
      likeCount: allLikes?.length || 0,
    };
  }),

  // 좋아요 토글
  toggleLike: protectedProcedure.input(z.object({ promptId: z.string() })).mutation(async ({ ctx, input }) => {
    const { promptId } = input;
    const { userId } = ctx;

    // 현재 좋아요 상태 확인
    const { data: existingLike } = await ctx.supabase
      .from("likes")
      .select("id")
      .eq("prompt_id", promptId)
      .eq("user_id", userId)
      .single();

    if (existingLike) {
      // 좋아요 취소
      const { error } = await ctx.supabase.from("likes").delete().eq("prompt_id", promptId).eq("user_id", userId);

      if (error) throw new Error("좋아요 취소에 실패했습니다.");

      return { isLiked: false, action: "removed" };
    } else {
      // 좋아요 추가
      const { error } = await ctx.supabase.from("likes").insert({
        prompt_id: promptId,
        user_id: userId,
      });

      if (error) throw new Error("좋아요 추가에 실패했습니다.");

      return { isLiked: true, action: "added" };
    }
  }),
});
