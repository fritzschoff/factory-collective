export type ProductKind = 'fashion' | 'bag' | 'jewellery' | 'scan' | 'print';
export type OptionRole = 'variant' | 'config';
export type OptionType = 'swatch' | 'size' | 'choice' | 'text';
export type ProductStatus = 'draft' | 'active' | 'archived';
export type ReservationStatus = 'pending' | 'awaiting_payment' | 'completed' | 'released';
export type OrderStatus = 'paid' | 'in_progress' | 'shipped' | 'done' | 'awaiting_payment' | 'cancelled';

export interface OptionValue {
  id: string;
  label: string;
  swatch?: string;
  priceCents?: number | null;
}

export interface ShopOption {
  id: string;
  label: string;
  role: OptionRole;
  type: OptionType;
  values?: OptionValue[];
  note?: string;
  max?: number;
  optional?: boolean;
}

export interface ShopVariant {
  key: string;
  priceCents: number | null;
  values: Record<string, string>;
}

export interface ShopImage {
  path: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  focus: string | null;
  slot: string;
}

export interface TextLink {
  label: string;
  href?: string;
  soon?: string;
}

export interface ShopProduct {
  id: string;
  kind: ProductKind;
  group: string;
  code: string;
  slug: string;
  name: string;
  material: string;
  sub?: string;
  description: string;
  spec: [string, string][];
  accordions: { title: string; body: string }[];
  note: string;
  lead: string;
  dims?: string;
  inv: string;
  tag?: string;
  textLink?: TextLink;
  work?: { id: string; edition: 'poster' | 'archival' };
  images: ShopImage[];
  ground?: boolean;
  pos?: string;
  priceCents: number | null;
  options: ShopOption[];
  variants: ShopVariant[];
  status: ProductStatus;
  href: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface InventoryDoc {
  sku: string;
  productId: string;
  onHand: number | null;
  reserved: number;
}

export interface ReservationItem {
  sku: string;
  productId: string;
  qty: number;
  unitAmount: number;
  name: string;
  code: string;
  image?: string;
  options: { id: string; label: string; value: string }[];
}

export interface Reservation {
  items: ReservationItem[];
  status: ReservationStatus;
  expiresAt: string;
  stripeSessionId?: string;
  orderId?: string;
  booked?: boolean;
}

export interface OrderLine {
  sku: string;
  productId: string;
  qty: number;
  name: string;
  code: string;
  unitAmount: number;
  options: { id: string; label: string; value: string }[];
}

export interface ShopOrder {
  number: number;
  status: OrderStatus;
  email?: string;
  name?: string;
  phone?: string;
  address?: Record<string, string | null>;
  items: OrderLine[];
  amountTotal?: number;
  currency?: string;
  stripeSessionId: string;
  stripePaymentIntent?: string;
  tracking?: string;
  note?: string;
  shortfall: boolean;
  history: { at: string; status: OrderStatus }[];
  createdAt: string;
}

export interface CodeOption {
  id: string;
  label: string;
  type: OptionType;
  values?: { id: string; label: string; swatch?: string }[];
  note?: string;
  max?: number;
  optional?: boolean;
}

export interface CodeProduct {
  id: string;
  code: string;
  slug: string;
  kind: ProductKind;
  group: string;
  name: string;
  material: string;
  sub?: string;
  description: string;
  images: string[];
  pos?: string;
  ground?: boolean;
  tag?: string;
  options: CodeOption[];
  spec: [string, string][];
  note: string;
  dims?: string;
  inv: string;
  text?: TextLink;
  accordions: { title: string; body: string }[];
  href: string;
  lead: string;
  work?: { id: string; edition: 'poster' | 'archival' };
}
