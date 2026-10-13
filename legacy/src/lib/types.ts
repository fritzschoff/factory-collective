export type World = 'factory' | 'atelier' | 'studio';
export type ProductKind = 'fashion' | 'bag' | 'jewellery' | 'scan' | 'print';

export interface OptionValue { id: string; label: string; swatch?: string }
/** One choice the buyer makes before adding to the bag. Goes to Stripe as metadata. */
export interface OptionDef {
  id: string;
  label: string;
  type: 'swatch' | 'size' | 'choice' | 'text';
  values?: OptionValue[];
  note?: string;
  /** text options: max length */
  max?: number;
  optional?: boolean;
}

export interface Product {
  /** Stripe metadata `cfc_code` and the key everywhere in this code base: JK-001 */
  id: string;
  /** Printed code: JK / 001 */
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
  /** slot keys. First one is the primary picture, all following are the gallery. */
  images: string[];
  /** object-position for the primary picture in crops (tiles, rails) */
  pos?: string;
  /** primary picture sits on a paper ground (object photos) */
  ground?: boolean;
  tag?: string;
  options: OptionDef[];
  /** museum label rows */
  spec: [string, string][];
  /** line under the Add button */
  note: string;
  dims?: string;
  inv: string;
  parent?: { href: string; label: string };
  /** thesis text this belongs to */
  text?: { href: string; label: string };
  /** what the accordions say */
  accordions: { title: string; body: string }[];
  href: string;
  /** filled from Stripe / data/prices.json at build time */
  priceCents?: number | null;
  stripePriceId?: string | null;
  stripeProductId?: string | null;
  /** short lead time shown in the bag */
  lead: string;
  /** works only: which work / edition */
  work?: { id: string; edition: 'poster' | 'archival' };
}

export interface Crumb { label: string; href?: string }

export interface RouteDef {
  path: string;                 // '/atelier/fashion/'
  title: string;
  description: string;
  world?: World | null;
  active?: 'campaigns' | 'about' | null;
  /** the picture that runs through the window of the sign at the top of the page */
  band?: { slot: string; pos?: string };
  /** social image slot */
  og?: string;
  noindex?: boolean;
  /** text shown in the footer title block */
  sheet: string;
  element: () => any;
  search?: { kind: string; label: string; sub?: string; slot?: string };
}
