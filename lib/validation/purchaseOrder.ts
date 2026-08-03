import { z } from "zod";

export const purchaseOrderSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  supplier_id: z.string().uuid().nullable(),
  received_date: z.string(),
  purchase_number: z.string(),
  title: z.string(),
  value: z.number().nonnegative(),
  description: z.string(),
  quantity: z.number().int().nonnegative(),
  photo_drive_file_id: z.string().nullable(),
  photo_view_link: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const purchaseOrderInputSchema = z.object({
  property_id: z.string().uuid(),
  supplier_id: z
    .preprocess((value) => (value === "" ? null : value), z.string().uuid().nullable())
    .default(null),
  received_date: z.string().trim().min(1, "Received date is required"),
  purchase_number: z.string().trim().default(""),
  title: z.string().trim().min(1, "Title is required"),
  value: z.coerce.number().min(0, "Value must be 0 or more").default(0),
  description: z.string().trim().default(""),
  quantity: z.coerce.number().int().min(0, "Quantity must be 0 or more").default(1),
});

export type PurchaseOrderInput = z.infer<typeof purchaseOrderInputSchema>;
