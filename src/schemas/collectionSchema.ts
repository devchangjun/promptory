import { z } from "zod";

// 컬렉션 카테고리 스키마
export const collectionCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "카테고리 이름은 필수입니다."),
  description: z.string().optional().nullable(),
  icon_name: z.string().optional().nullable(),
  display_order: z.number().default(0),
  is_active: z.boolean().default(true),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

// 컬렉션 스키마 (실제 DB 구조에 맞게 수정)
export const collectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "제목은 필수입니다.").max(255, "제목은 255자 이하로 입력해주세요."),
  description: z.string().optional().nullable(),
  user_id: z.string(),
  is_public: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  category_id: z.string().optional().nullable(),
  category: z.string().optional().nullable(), // JOIN된 카테고리 이름
  thumbnail_url: z.string().optional().nullable(),
  view_count: z.number().default(0),
  like_count: z.number().default(0),
  prompt_count: z.number().min(0).max(100).default(0),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

// 컬렉션-프롬프트 관계 스키마
export const collectionPromptSchema = z.object({
  id: z.string(),
  collection_id: z.string(),
  prompt_id: z.string(),
  order_index: z.number().default(0),
  added_at: z.string().optional().nullable(),
});

// 컬렉션 생성 입력 스키마
export const createCollectionSchema = z.object({
  name: z.string().min(1, "제목은 필수입니다.").max(255, "제목은 255자 이하로 입력해주세요."),
  description: z.string().optional(),
  category_id: z.string().optional(),
  is_public: z.boolean().default(true),
  prompt_ids: z.array(z.string()).max(100, "프롬프트는 최대 100개까지 추가할 수 있습니다.").optional().default([]),
});

// 컬렉션 수정 입력 스키마
export const updateCollectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "제목은 필수입니다.").max(255, "제목은 255자 이하로 입력해주세요.").optional(),
  description: z.string().optional(),
  category_id: z.string().optional(),
  is_public: z.boolean().optional(),
});

// 컬렉션에 프롬프트 추가 스키마
export const addPromptToCollectionSchema = z.object({
  collection_id: z.string(),
  prompt_id: z.string(),
  order_index: z.number().optional(),
});

// TypeScript 타입 export
export type Collection = z.infer<typeof collectionSchema>;
export type CollectionCategory = z.infer<typeof collectionCategorySchema>;
export type CollectionPrompt = z.infer<typeof collectionPromptSchema>;
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type AddPromptToCollectionInput = z.infer<typeof addPromptToCollectionSchema>;
