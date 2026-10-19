import type { SoonKey } from '@/content/soon';

export type ProductKind = 'fashion' | 'bag' | 'jewellery' | 'scan' | 'print';

export interface OptionValue { id: string; label: string; swatch?: string }

/** One choice the buyer makes before adding to the bag. */
export type ProductStatus = 'draft' | 'active' | 'archived';

export interface ProductMedia {
  slot: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  focus: string | null;
}

export interface OptionDef {
  id: string;
  label: string;
  role?: 'variant' | 'config';
  type: 'swatch' | 'size' | 'choice' | 'text';
  values?: OptionValue[];
  note?: string;
  /** text options: maximum length */
  max?: number;
  optional?: boolean;
}

/** From a product to the text it came out of; `soon` while the text is not written. */
export type TextLink = { label: string } & ({ href: string } | { soon: SoonKey });

export interface Product {
  /** the key everywhere: JK-001 */
  id: string;
  /** printed code: JK / 001 */
  code: string;
  slug: string;
  kind: ProductKind;
  /** group inside the series (jackets, vases …) */
  group: string;
  name: string;
  /** one short line: cloth / metal / glaze */
  material: string;
  sub?: string;
  description: string;
  /** image slot keys; the first is the main picture, the rest the gallery */
  images: string[];
  /** storage copies of those slots, when the catalogue comes from Firebase */
  media?: ProductMedia[];
  status?: ProductStatus;
  /** object-position of the main picture in crops */
  pos?: string;
  /** main picture is an object on a paper ground */
  ground?: boolean;
  tag?: string;
  options: OptionDef[];
  /** museum label rows */
  spec: [string, string][];
  /** line under the Add button */
  note: string;
  dims?: string;
  inv: string;
  text?: TextLink;
  accordions: { title: string; body: string }[];
  href: string;
  /** set by the data layer (src/lib/data/catalog.ts) */
  priceCents?: number | null;
  /** short lead time shown in the bag */
  lead: string;
  /** prints only: which work, which edition */
  work?: { id: string; edition: 'poster' | 'archival' };
}

export interface Crumb { label: string; href?: string }
