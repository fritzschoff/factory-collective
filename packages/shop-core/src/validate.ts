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

export const PRODUCT_GROUPS = {
  fashion: ['jackets', 'shirts', 'trousers', 'vests'],
  bag: ['bags', 'totes'],
  jewellery: ['cuffs', 'bangles', 'bracelets'],
  scan: ['vases', 'catch-alls', 'holders', 'trays'],
  print: ['prints'],
} as const;

const optionValueSchema = z.object({
  id: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1).max(80),
  swatch: z.string().max(40).optional(),
  priceCents: z.number().int().positive().nullable().optional(),
});

const optionSchema = z.object({
  id: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1, 'Bitte eine Bezeichnung eintragen.').max(80),
  role: z.enum(['variant', 'config']),
  type: z.enum(['swatch', 'size', 'choice', 'text']),
  values: z.array(optionValueSchema).max(40).optional(),
  note: z.string().max(200).optional(),
  max: z.number().int().positive().max(40).optional(),
  optional: z.boolean().optional(),
});

const imageSchema = z.object({
  path: z.string().max(300),
  url: z.string().max(1000),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
  alt: z.string().max(200),
  focus: z.string().max(40).nullable(),
  slot: z.string().max(200),
});

export const productSaveSchema = z.object({
  id: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9.-]{0,40}$/, 'Die Kennung darf Buchstaben, Zahlen, Punkt und Bindestrich enthalten.'),
  kind: z.enum(['fashion', 'bag', 'jewellery', 'scan', 'print']),
  group: z.string().trim().min(1, 'Bitte einen Bereich wählen.'),
  code: z.string().trim().min(1, 'Bitte einen Code eintragen.').max(40),
  slug: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1, 'Bitte einen Namen eintragen.').max(160),
  material: z.string().trim().max(80),
  sub: z.string().trim().max(160).optional().default(''),
  description: z.string().trim().max(4000),
  spec: z.array(z.tuple([z.string().trim().max(80), z.string().trim().max(200)])).max(30),
  accordions: z.array(z.object({ title: z.string().trim().min(1).max(80), body: z.string().trim().max(4000) })).max(12),
  note: z.string().trim().max(1000),
  lead: z.string().trim().max(120),
  dims: z.string().trim().max(120).optional().default(''),
  inv: z.string().trim().max(80),
  tag: z.string().trim().max(40).optional().default(''),
  priceCents: z.number().int().positive().nullable(),
  options: z.array(optionSchema).max(12),
  status: z.enum(['draft', 'active', 'archived']),
  href: z.string().trim().min(1).max(200),
  images: z.array(imageSchema).max(24).default([]),
  ground: z.boolean().optional(),
  pos: z.string().max(40).optional(),
  updatedAt: z.string().optional(),
  variantPrices: z.record(z.string().max(80), z.number().int().positive().nullable()).default({}),
  stock: z.record(z.string().max(120), z.number().int().min(0).nullable()).default({}),
});

export type ProductSave = z.infer<typeof productSaveSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export type CheckoutBody = z.infer<typeof checkoutBodySchema>;
export type EnquireBody = z.infer<typeof enquireSchema>;
export type NewsletterBody = z.infer<typeof newsletterSchema>;
