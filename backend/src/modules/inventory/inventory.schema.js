import { z } from 'zod';

export const receiveStockSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().positive('Inward quantity must be greater than zero'),
  invoice_no: z.string().optional(),
  notes: z.string().optional(),
});

export const damageStockSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().positive('Damaged quantity must be greater than zero'),
  reason: z.string().min(3, 'Detailed reason for damage or leakage write-off is required'),
});

export const reversalSchema = z.object({
  movement_id: z.string().min(1, 'Movement ID to reverse is required'),
  reason: z.string().min(5, 'Audited reversal reason is required'),
});
