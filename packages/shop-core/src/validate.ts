import { z } from 'zod';

export const MAX_QTY = 9;

const positiveInt = z.number().int().positive();

export function clampQty(qty: unknown): number | null {
  const parsed = positiveInt.safeParse(qty);
  if (!parsed.success) return null;
  return Math.min(MAX_QTY, parsed.data);
}

export const qtySchema = z.number().int().min(1).max(MAX_QTY);

export const checkoutItemSchema = z.object({
  id: z.string().trim().min(1).max(64),
  qty: qtySchema,
  opts: z.record(z.string().max(64), z.string().max(200)).optional().default({}),
});

export const checkoutBodySchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(30),
});

export const enquireSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  message: z.string().trim().max(5000).optional().default(''),
  subject: z.string().trim().max(80).optional().default('general'),
  work: z.string().trim().max(200).optional().default(''),
  company: z.string().max(200).optional().default(''),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(200),
  company: z.string().max(200).optional().default(''),
});

export type CheckoutBody = z.infer<typeof checkoutBodySchema>;
export type EnquireBody = z.infer<typeof enquireSchema>;
export type NewsletterBody = z.infer<typeof newsletterSchema>;
