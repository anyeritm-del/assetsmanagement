import { z } from "zod";

export const articleGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const articleGroupInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type ArticleGroupInput = z.infer<typeof articleGroupInputSchema>;
