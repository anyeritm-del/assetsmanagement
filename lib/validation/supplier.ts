import { z } from "zod";

export const supplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const supplierInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().default(""),
  phone: z.string().trim().default(""),
  address: z.string().trim().default(""),
  description: z.string().trim().default(""),
});

export type SupplierInput = z.infer<typeof supplierInputSchema>;
