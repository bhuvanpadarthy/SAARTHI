import { z } from 'zod';

export const createDraftSaleSchema = z.object({
  bill_number: z.string().optional(),
  customer_id: z.string().uuid().optional().nullable(),
  customer_name: z.string().optional().default('Walk-in Retail Buyer'),
  customer_phone: z.string().optional().nullable(),
  payment_mode: z.enum(['Cash', 'UPI', 'Debit / Credit Card', 'Khata / Credit']).default('Cash'),
  discount: z.coerce.number().nonnegative().default(0),
  notes: z.string().optional().nullable(),
  idempotency_key: z.string().optional().nullable(),
  items: z.array(
    z.object({
      product_id: z.string().min(1, 'Product ID is required'),
      quantity: z.coerce.number().positive('Quantity must be greater than zero'),
      unit_price: z.coerce.number().nonnegative().optional(),
    })
  ).min(1, 'At least one paint item is required on the paper bill'),
});

export const confirmSaleSchema = z.object({
  idempotency_key: z.string().optional(),
});
