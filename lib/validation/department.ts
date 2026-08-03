import { z } from "zod";

export const departmentSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const departmentInputSchema = z.object({
  code: z.string().trim().default(""),
  name: z.string().trim().min(1, "Name is required"),
});

export type DepartmentInput = z.infer<typeof departmentInputSchema>;
