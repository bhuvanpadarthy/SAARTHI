import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  brand: z.string().min(1, 'Brand is required (e.g. Asian Paints, Berger)'),
  category: z.string().min(1, 'Category is required (e.g. Interior Emulsion, Primer)'),
  pack_size: z.string().min(1, 'Pack size is required (e.g. 20 L, 4 L, 15 Kg)'),
  unit_of_measure: z.enum(['L', 'Kg', 'Piece', 'Tin', 'Bucket', 'Drum', 'Gram', 'ML']).default('L'),
  shade_code: z.string().min(1, 'Shade code is required'),
  shade_hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code').default('#FFFFFF'),
  finish: z.string().optional().default('Standard Finish'),
  rack_location: z.string().optional().default('Main Rack'),
  selling_price: z.coerce.number().positive('Selling price must be greater than 0'),
  cost_price: z.coerce.number().nonnegative('Cost price cannot be negative').default(0),
  mrp: z.coerce.number().nonnegative('MRP cannot be negative').optional(),
  reorder_threshold: z.coerce.number().nonnegative('Reorder threshold cannot be negative').default(5),
  opening_stock: z.coerce.number().nonnegative('Opening stock cannot be negative').default(0),
  distributor: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const queryProductsSchema = z.object({
  search: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  pack_size: z.string().optional(),
  stock_status: z.enum(['ALL', 'LOW', 'OUT', 'HEALTHY']).optional().default('ALL'),
});
