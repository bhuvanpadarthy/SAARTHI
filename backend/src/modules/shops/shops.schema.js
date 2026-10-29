import { z } from 'zod';

export const updateShopSettingsSchema = z.object({
  name: z.string().min(1, 'Shop name cannot be empty').optional(),
  tagline: z.string().optional().nullable(),
  owner_name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  bill_prefix: z.string().optional(),
  next_bill_number: z.coerce.number().int().positive().optional(),
  currency: z.string().optional(),
  low_stock_threshold: z.coerce.number().positive().optional(),
  bill_footer_note: z.string().optional().nullable(),
});
