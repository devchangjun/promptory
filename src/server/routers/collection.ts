import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "../trpc";
import {
  createCollectionSchema,
  updateCollectionSchema,
  addPromptToCollectionSchema,
} from "@/schemas/collectionSchema";

export const collectionRouter = router({
  // 컬렉션 카테고리 목록 조회
  getCollectionCategories: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("collection_categories")
      .select("id, name, description, icon_name")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  }),

  // 컬렉션 목록 조회 (필터링, 페이지네이션 지원)
  getCollections: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        q: z.string().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(12),
        userId: z.string().optional(), // 특정 사용자의 컬렉션만 조회
        onlyPublic: z.boolean().default(true),
      })
    )
    .query(async ({ input, ctx }) => {
      const { category, q, page, pageSize, userId, onlyPublic } = input;

      // 1. 컬렉션 조회 쿼리 구성
      let query = ctx.supabase
        .from("collections")
        .select(
          "id, name, description, user_id, is_public, category_id, view_count, like_count, prompt_count, created_at",
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      // 필터링 조건 적용
      if (onlyPublic) query = query.eq("is_public", true);
      if (category) query = query.eq("category_id", category);
      if (userId) query = query.eq("user_id", userId);
      if (q) query = query.ilike("name", `%${q}%`);

      // 페이지네이션 적용
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: collectionsData, count, error: collectionsError } = await query;

      if (collectionsError) throw collectionsError;
      if (!collectionsData || collectionsData.length === 0) {
        return {
          collections: [],
          total: count || 0,
          totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)),
        };
      }

      // 2. 카테고리 정보 조회
      const { data: categoriesData } = await ctx.supabase.from("collection_categories").select("id, name");

      // 3. 데이터 조합
      const categoryMap = Object.fromEntries((categoriesData || []).map((c) => [c.id, c.name]));

      const collections = collectionsData.map((collection) => ({
        ...collection,
        category: collection.category_id ? categoryMap[collection.category_id] : null,
      }));

      return {
        collections,
        total: count || 0,
        totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)),
      };
    }),

  // 컬렉션 상세 조회 (포함된 프롬프트 목록 포함)
  getCollectionById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const { id } = input;

    // 1. 컬렉션 기본 정보 조회
    const { data: collectionData, error: collectionError } = await ctx.supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (collectionError) throw collectionError;
    if (!collectionData) return null;

    // 2. 카테고리 정보 조회
    let categoryName = null;
    if (collectionData.category_id) {
      const { data: categoryData } = await ctx.supabase
        .from("collection_categories")
        .select("name")
        .eq("id", collectionData.category_id)
        .single();
      categoryName = categoryData?.name;
    }

    // 3. 컬렉션에 포함된 프롬프트들 조회 (순서대로)
    const { data: collectionPrompts, error: promptsError } = await ctx.supabase
      .from("collection_prompts")
      .select(
        `
          order_index,
          prompts (
            id, title, content, created_at, user_id, category_id
          )
        `
      )
      .eq("collection_id", id)
      .order("order_index", { ascending: true });

    if (promptsError) throw promptsError;

    // 4. 프롬프트 카테고리 정보 조회
    const { data: promptCategoriesData } = await ctx.supabase.from("categories").select("id, name");

    const promptCategoryMap = Object.fromEntries((promptCategoriesData || []).map((c) => [c.id, c.name]));

    // 5. 프롬프트 좋아요 수 조회
    type CollectionPromptWithPrompt = {
      order_index: number;
      prompts: {
        id: string;
        title: string;
        content: string;
        created_at: string;
        user_id: string;
        category_id: string | null;
      } | null;
    };

    const promptIds = ((collectionPrompts as unknown as CollectionPromptWithPrompt[]) || [])
      .map((cp) => cp.prompts?.id)
      .filter(Boolean);

    let likeCounts: Record<string, number> = {};
    if (promptIds.length > 0) {
      const { data: likesData } = await ctx.supabase.from("likes").select("prompt_id").in("prompt_id", promptIds);

      likeCounts = (likesData || []).reduce((acc, like) => {
        acc[like.prompt_id] = (acc[like.prompt_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }

    // 6. 데이터 조합
    const prompts = ((collectionPrompts as unknown as CollectionPromptWithPrompt[]) || [])
      .map((cp) => {
        if (!cp.prompts) return null;
        return {
          ...cp.prompts,
          category: cp.prompts.category_id ? promptCategoryMap[cp.prompts.category_id] : null,
          likeCount: likeCounts[cp.prompts.id] || 0,
          order_index: cp.order_index,
        };
      })
      .filter(Boolean);

    // 조회수 증가
    await ctx.supabase
      .from("collections")
      .update({ view_count: collectionData.view_count + 1 })
      .eq("id", id);

    return {
      ...collectionData,
      category: categoryName,
      prompts,
    };
  }),

  // 내가 만든 컬렉션 목록 조회
  getMyCollections: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    const { data, error } = await ctx.supabase
      .from("collections")
      .select("id, name, description, is_public, prompt_count, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }),

  // 컬렉션 생성
  createCollection: protectedProcedure.input(createCollectionSchema).mutation(async ({ ctx, input }) => {
    const { name, description, category_id, is_public, prompt_ids } = input;
    const { userId } = ctx;

    // 1. 컬렉션 생성
    const { data: collectionData, error: collectionError } = await ctx.supabase
      .from("collections")
      .insert({
        name,
        description: description || null,
        category_id: category_id || null,
        is_public,
        user_id: userId,
        prompt_count: prompt_ids.length,
      })
      .select("id")
      .single();

    if (collectionError) throw new Error(collectionError.message);

    const collectionId = collectionData.id;

    // 2. 프롬프트들을 컬렉션에 추가
    if (prompt_ids && prompt_ids.length > 0) {
      const collectionPrompts = prompt_ids.map((promptId: string, index: number) => ({
        collection_id: collectionId,
        prompt_id: promptId,
        order_index: index,
      }));

      const { error: promptsError } = await ctx.supabase.from("collection_prompts").insert(collectionPrompts);

      if (promptsError) throw new Error(promptsError.message);
    }

    return { id: collectionId };
  }),

  // 컬렉션 수정
  updateCollection: protectedProcedure.input(updateCollectionSchema).mutation(async ({ ctx, input }) => {
    const { id, name, description, category_id, is_public } = input;
    const { userId } = ctx;

    // 권한 확인
    const { data: existingCollection, error: fetchError } = await ctx.supabase
      .from("collections")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error("컬렉션을 찾을 수 없습니다.");
    if (existingCollection.user_id !== userId) {
      throw new Error("컬렉션을 수정할 권한이 없습니다.");
    }

    // 수정
    const { error } = await ctx.supabase
      .from("collections")
      .update({
        name,
        description,
        category_id,
        is_public,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    return { success: true };
  }),

  // 컬렉션 삭제
  deleteCollection: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const { id } = input;
    const { userId } = ctx;

    // 권한 확인
    const { data: existingCollection, error: fetchError } = await ctx.supabase
      .from("collections")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError) throw new Error("컬렉션을 찾을 수 없습니다.");
    if (existingCollection.user_id !== userId) {
      throw new Error("컬렉션을 삭제할 권한이 없습니다.");
    }

    const { error } = await ctx.supabase.from("collections").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return { success: true };
  }),

  // 컬렉션에 프롬프트 추가
  addPromptToCollection: protectedProcedure.input(addPromptToCollectionSchema).mutation(async ({ ctx, input }) => {
    const { collection_id, prompt_id, order_index } = input;
    const { userId } = ctx;

    // 권한 확인
    const { data: collection, error: fetchError } = await ctx.supabase
      .from("collections")
      .select("user_id, prompt_count")
      .eq("id", collection_id)
      .single();

    if (fetchError) throw new Error("컬렉션을 찾을 수 없습니다.");
    if (collection.user_id !== userId) {
      throw new Error("컬렉션을 수정할 권한이 없습니다.");
    }
    if (collection.prompt_count >= 100) {
      throw new Error("컬렉션에는 최대 100개의 프롬프트만 추가할 수 있습니다.");
    }

    // 중복 확인
    const { data: existing } = await ctx.supabase
      .from("collection_prompts")
      .select("id")
      .eq("collection_id", collection_id)
      .eq("prompt_id", prompt_id)
      .single();

    if (existing) {
      throw new Error("이미 컬렉션에 추가된 프롬프트입니다.");
    }

    // 순서 인덱스 설정
    const finalOrderIndex = order_index !== undefined ? order_index : collection.prompt_count;

    const { error } = await ctx.supabase.from("collection_prompts").insert({
      collection_id,
      prompt_id,
      order_index: finalOrderIndex,
    });

    if (error) throw new Error(error.message);

    return { success: true };
  }),

  // 컬렉션에서 프롬프트 제거
  removePromptFromCollection: protectedProcedure
    .input(
      z.object({
        collection_id: z.string(),
        prompt_id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { collection_id, prompt_id } = input;
      const { userId } = ctx;

      // 권한 확인
      const { data: collection, error: fetchError } = await ctx.supabase
        .from("collections")
        .select("user_id")
        .eq("id", collection_id)
        .single();

      if (fetchError) throw new Error("컬렉션을 찾을 수 없습니다.");
      if (collection.user_id !== userId) {
        throw new Error("컬렉션을 수정할 권한이 없습니다.");
      }

      const { error } = await ctx.supabase
        .from("collection_prompts")
        .delete()
        .eq("collection_id", collection_id)
        .eq("prompt_id", prompt_id);

      if (error) throw new Error(error.message);

      return { success: true };
    }),

  // 컬렉션 좋아요/좋아요 취소
  toggleCollectionLike: protectedProcedure
    .input(z.object({ collection_id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { collection_id } = input;
      const { userId } = ctx;

      // 1. 기존 좋아요 확인
      const { data: existingLike } = await ctx.supabase
        .from("collection_likes")
        .select("id")
        .eq("collection_id", collection_id)
        .eq("user_id", userId)
        .single();

      if (existingLike) {
        // 좋아요 취소
        const { error } = await ctx.supabase.from("collection_likes").delete().eq("id", existingLike.id);

        if (error) throw error;
        return { liked: false };
      } else {
        // 좋아요 추가
        const { error } = await ctx.supabase.from("collection_likes").insert({
          collection_id,
          user_id: userId,
        });

        if (error) throw error;
        return { liked: true };
      }
    }),

  // 컬렉션 좋아요 상태 확인
  getCollectionLikeStatus: protectedProcedure
    .input(z.object({ collection_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { collection_id } = input;
      const { userId } = ctx;

      const { data } = await ctx.supabase
        .from("collection_likes")
        .select("id")
        .eq("collection_id", collection_id)
        .eq("user_id", userId)
        .single();

      return { liked: !!data };
    }),
});
