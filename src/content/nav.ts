import type { SoonKey } from '@/content/soon';
import type { WorldId } from '@/lib/nav/world';
import type { ProductKind } from '@/lib/types';

/** How many pieces a series or group has — counted from the catalogue, never typed in. */
export interface CountOf { kind: ProductKind; group?: string }

/** A row of the menu: a link (with the pictures its hover window shows), or a coming-soon entry. */
export type NavEntry =
  | { label: string; href: string; count?: CountOf; win?: string[]; cap?: string }
  | { soon: SoonKey };

export interface NavGroup { head: NavEntry; note?: string; items?: NavEntry[] }

export interface NavWorld {
  id: WorldId;
  label: string;
  verb?: string;
  line?: string;
  enter: { label: string; href: string };
  /** pictures of the window while no row is hovered, and the line under it */
  win: string[];
  cap: string;
  /** up to four columns, each one or more groups */
  columns: NavGroup[][];
  /** Campaigns and About are grey in the tab row */
  quiet?: boolean;
}

export const NAV: NavWorld[] = [
  {
    id: 'factory', label: 'Factory', verb: 'to think', line: 'The drawing room. Everything else is obliged to what is written here.',
    enter: { label: 'Enter the Factory', href: '/factory/' }, win: ['factory/section-1', 'factory/section-3', 'factory/stair'], cap: 'T01 · T02 · Glossary',
    columns: [
      [{ head: { label: 'Texts', href: '/factory/#texts', win: ['factory/section-1', 'jewellery/hero', 'bags/hero'], cap: 'T01 · T02 · T03' }, note: '( 3 )', items: [
        { label: 'Tectonics without origin', href: '/factory/tectonics-without-origin/', win: ['factory/section-1', 'factory/stair', 'factory/section-3'], cap: 'T01 // profile' },
        { label: 'Ordinary Objects', href: '/factory/ordinary-objects/', win: ['jewellery/hero', 'scan/OB-021', 'jewellery/BR-B'], cap: 'T02 // ordinary object' },
        { soon: 'bagText' },
      ] }],
      [{ head: { label: 'Theses', href: '/factory/#theses', win: ['factory/section-1', 'jewellery/BR-A'], cap: 'T01 · T02' }, note: '( 2 of n )', items: [
        { label: 'T01 // profile', href: '/factory/#t01', win: ['bags/BG-114', 'fashion/JK-001', 'factory/section-2'], cap: 'Fashion · Bags' },
        { label: 'T02 // ordinary object', href: '/factory/#t02', win: ['jewellery/BR-A', 'scan/OB-011', 'scan/OB-021'], cap: 'Jewellery · Scan Series' },
        { soon: 'theses' },
      ] }],
      [{ head: { label: 'Glossary', href: '/factory/glossary/', win: ['factory/section-4', 'factory/section-2'], cap: 'F · A · S' } }],
      [{ head: { soon: 'publishing' } }, { head: { soon: 'archive' } }, { head: { soon: 'lectures' } }],
    ],
  },
  {
    id: 'atelier', label: 'Atelier', verb: 'to make', line: 'The workshop. Everything here is cut, cast or printed — and everything here can be bought.',
    enter: { label: 'Enter the Atelier', href: '/atelier/' }, win: ['fashion/JK-001', 'bags/BG-114', 'jewellery/BR-A', 'scan/OB-011'], cap: 'JK / 001 · BG / 114 · BR / 0??.a · OB / 011',
    columns: [
      [{ head: { label: 'Fashion', href: '/atelier/fashion/', count: { kind: 'fashion' }, win: ['fashion/SH-001', 'fashion/JK-004', 'fashion/TR-002', 'fashion/VT-001'], cap: 'SH / 001 · JK / 004 · TR / 002 · VT / 001' }, items: [
        { label: 'Jackets', href: '/atelier/fashion/#jackets', count: { kind: 'fashion', group: 'jackets' }, win: ['fashion/JK-004', 'fashion/JK-001'] },
        { label: 'Shirts', href: '/atelier/fashion/#shirts', count: { kind: 'fashion', group: 'shirts' }, win: ['fashion/SH-001', 'fashion/SH-001-2', 'fashion/SH-001-3'] },
        { label: 'Trousers', href: '/atelier/fashion/#trousers', count: { kind: 'fashion', group: 'trousers' }, win: ['fashion/TR-002', 'fashion/TR-001'] },
        { label: 'Vests', href: '/atelier/fashion/#vests', count: { kind: 'fashion', group: 'vests' }, win: ['fashion/VT-001'] },
        { soon: 'outerwear' },
      ] }],
      [{ head: { label: 'Bag / Profile Series', href: '/atelier/bags/', count: { kind: 'bag' }, win: ['bags/BG-114', 'bags/BG-098', 'bags/BG-086', 'bags/BG-NEW'], cap: 'BG / 114 · 098 · 086' }, items: [
        { label: 'BG / 114  tote', href: '/atelier/bags/bg-114/', win: ['bags/BG-114', 'bags/BG-114-2'], cap: 'BG / 114' },
        { label: 'BG / 098  shoulder bag', href: '/atelier/bags/bg-098/', win: ['bags/BG-098'], cap: 'BG / 098' },
        { label: 'BG / 086  clutch', href: '/atelier/bags/bg-086/', win: ['bags/BG-086'], cap: 'BG / 086' },
        { label: 'BG / 0??  stitched panels', href: '/atelier/bags/bg-new/', win: ['bags/BG-NEW'], cap: 'BG / 0??' },
        { soon: 'moreBags' },
      ] }],
      [{ head: { label: 'Jewellery', href: '/atelier/jewellery/', count: { kind: 'jewellery' }, win: ['jewellery/BR-A', 'jewellery/BR-B', 'jewellery/BR-C', 'jewellery/BR-D'], cap: 'BR / 0??.a – d' }, items: [
        { label: 'Cuffs', href: '/atelier/jewellery/br-a/', count: { kind: 'jewellery', group: 'cuffs' }, win: ['jewellery/BR-A', 'jewellery/BR-A-2'] },
        { label: 'Bangles', href: '/atelier/jewellery/', count: { kind: 'jewellery', group: 'bangles' }, win: ['jewellery/BR-B', 'jewellery/BR-C', 'jewellery/BR-D'] },
        { label: 'Bracelets', href: '/atelier/jewellery/br-e/', count: { kind: 'jewellery', group: 'bracelets' }, win: ['jewellery/BR-E'] },
        { soon: 'rings' },
      ] }],
      [{ head: { label: 'Scan Series', href: '/atelier/scan-series/', count: { kind: 'scan' }, win: ['scan/OB-011', 'scan/OB-021', 'scan/OB-031', 'scan/OB-034'], cap: 'OB / 011 · 021 · 031 · 034' }, items: [
        { label: 'Vases', href: '/atelier/scan-series/', count: { kind: 'scan', group: 'vases' }, win: ['scan/OB-011', 'scan/OB-012', 'scan/OB-013'] },
        { label: 'Catch-alls', href: '/atelier/scan-series/', count: { kind: 'scan', group: 'catch-alls' }, win: ['scan/OB-021', 'scan/OB-022', 'scan/OB-023'] },
        { label: 'Holders', href: '/atelier/scan-series/', count: { kind: 'scan', group: 'holders' }, win: ['scan/OB-031', 'scan/OB-032', 'scan/OB-033'] },
        { label: 'Trays', href: '/atelier/scan-series/', count: { kind: 'scan', group: 'trays' }, win: ['scan/OB-034', 'scan/OB-035', 'scan/OB-036'] },
      ] }, { head: { soon: 'furniture' } }],
    ],
  },
  {
    id: 'studio', label: 'Studio', verb: 'to enter', line: 'The space. The works are for sale: the original, and two print editions.',
    enter: { label: 'Enter the Studio', href: '/studio/' }, win: ['art/CI-07', 'art/LP-02-2', 'art/CI-detail'], cap: 'CI / 07 · LP / 02',
    columns: [
      [{ head: { label: 'Conceptual Interference', href: '/studio/conceptual-interference/', win: ['art/CI-07', 'art/CI-03', 'art/CI-11', 'art/CI-14'], cap: 'CI / 07 · 03 · 11 · 14' }, note: '( 15 )', items: [
        { label: 'CI / 07  original & prints', href: '/studio/conceptual-interference/ci-07/', win: ['art/CI-07', 'art/CI-detail'], cap: 'CI / 07' },
        { label: 'All fifteen plates', href: '/studio/conceptual-interference/#all', win: ['art/CI-01', 'art/CI-05', 'art/CI-09', 'art/CI-14'] },
      ] }],
      [{ head: { label: 'Layer Paintings', href: '/studio/layer-paintings/', win: ['art/LP-02-1', 'art/LP-02-2', 'art/LP-02-3'], cap: 'LP / 02 · three states' }, note: '( 4 )', items: [
        { label: 'LP / 02  triptych & prints', href: '/studio/layer-paintings/lp-02/', win: ['art/LP-02-1', 'art/LP-02-2', 'art/LP-02-3'], cap: 'LP / 02' },
        { label: 'Choose a state · poster, archival', href: '/studio/layer-paintings/lp-02/#states', win: ['art/LP-02-2', 'art/LP-01-2', 'art/LP-04-3'] },
      ] }],
      [{ head: { soon: 'exhibitions' } }, { head: { soon: 'sound' } }],
      [{ head: { soon: 'scenography' } }, { head: { soon: 'architecture' } }],
    ],
  },
  {
    id: 'campaigns', label: 'Campaigns', quiet: true,
    enter: { label: 'All campaigns', href: '/campaigns/' }, win: ['campaign-01/cover', 'campaign-02/cover'], cap: '( 01 ) · ( 02 )',
    columns: [
      [{ head: { label: '( 01 )  [ campaign title ]', href: '/campaigns/01/', win: ['campaign-01/cover', 'campaign-01/look-01', 'campaign-01/look-04'], cap: 'Autumn 2026' } }],
      [{ head: { label: '( 02 )  The objects, at home', href: '/campaigns/02/', win: ['campaign-02/cover', 'campaign-02/life-1'], cap: 'Scan Series, in use' } }],
      [{ head: { label: 'Editorials', href: '/campaigns/', win: ['art/CI-detail', 'art/LP-detail'] }, items: [
        { label: 'Conceptual Interference', href: '/studio/conceptual-interference/', win: ['art/CI-detail'] },
        { label: 'Layer Paintings', href: '/studio/layer-paintings/', win: ['art/LP-detail'] },
      ] }],
      [{ head: { soon: 'campaign03' } }],
    ],
  },
  {
    id: 'about', label: 'About', quiet: true,
    enter: { label: 'About', href: '/about/' }, win: ['art/CI-detail', 'fashion/JK-001', 'art/LP-detail'], cap: 'One sign, three rooms',
    columns: [
      [{ head: { label: 'One sign, three rooms', href: '/about/', win: ['art/CI-detail', 'fashion/JK-001', 'art/LP-detail'] } }],
      [{ head: { label: 'Contact', href: '/contact/', win: ['factory/section-3'] } }],
      [{ head: { soon: 'press' } }],
      [{ head: { soon: 'journal' } }],
    ],
  },
];

export const FOOTER: Record<'service' | 'company' | 'follow', NavEntry[]> = {
  service: [{ label: 'Contact', href: '/contact/' }, { label: 'Shipping', href: '/shipping/' }, { label: 'Returns', href: '/returns/' }, { label: 'FAQ', href: '/faq/' }],
  company: [{ label: 'About', href: '/about/' }, { label: 'Campaigns', href: '/campaigns/' }, { soon: 'journal' }, { label: 'Imprint', href: '/imprint/' }],
  follow: [{ label: 'Instagram', href: 'https://www.instagram.com/' }, { label: 'Newsletter', href: '/#newsletter' }],
};
