import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  customer_type: z.enum(['Contractor', 'Painter', 'Commercial', 'Homeowner']).default('Homeowner'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  credit_limit: z.coerce.number().nonnegative().default(0),
  outstanding_balance: z.coerce.number().default(0),
});

export const customerPaymentSchema = z.object({
  amount: z.coerce.number().positive('Payment amount must be greater than zero'),
  payment_mode: z.enum(['Cash', 'UPI', 'Bank Transfer', 'Cheque']).default('Cash'),
  reference_no: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
