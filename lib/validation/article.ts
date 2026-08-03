import { z } from "zod";

export const articleSchema = z.object({
  id: z.string().uuid(),
  article_group_id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  unit: z.string(),
  content: z.number().int().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const articleInputSchema = z.object({
  article_group_id: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().default(""),
  unit: z.string().trim().default(""),
  content: z.coerce.number().int().min(0, "Content must be 0 or more").default(1),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;
