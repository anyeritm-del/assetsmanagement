import { z } from "zod";

export const employeeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const employeeInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().default(""),
});

export type EmployeeInput = z.infer<typeof employeeInputSchema>;
