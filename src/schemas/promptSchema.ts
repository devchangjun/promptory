// schemas/promptSchema.ts
import { z } from "zod";

export const promptSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "제목은 필수입니다."),
  content: z.string().min(1, "내용은 필수입니다."),
  user_id: z.string(),
  category_id: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export type Prompt = z.infer<typeof promptSchema>;

export const categorySchema = z.object({
  name: z.string(),
});
