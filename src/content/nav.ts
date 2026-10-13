/**
 * The menu (and the sitemap's skeleton). Every level is a link: world → series → product / work.
 * `win`: the pictures that cross-fade between the brackets while the row is hovered (slot keys, 2–4).
 * `cap`: the line of codes under the window.
 * `coming: true`  → drawn in red with the dash-dot-dot line, as in the plan.
 */
export interface NavItem {
  label: string;
  href?: string;
  sheet?: string;
  count?: string;
  sub?: string;
  win?: string[];
  cap?: string;
  coming?: boolean;
  children?: NavItem[];
  /** extra links on one line under the row (Jackets (8) · Shirts (4)) */
  inline?: { label: string; href: string }[];
}

export interface NavWorld {
  id: 'factory' | 'atelier' | 'studio';
  letter: 'F' | 'A' | 'S';
  label: string;
  verb: string;
  line: string;
  href: string;
  sheet: string;
  win: string[];
  groups: NavItem[];
  enter: string;
}

export const NAV: NavWorld[] = [
  {
    id: 'factory', letter: 'F', label: 'Factory', verb: 'to think', href: '/factory/', sheet: '12', enter: 'Enter the Factory',
    line: 'The drawing room. Everything else is obliged to what is written here.',
    win: ['factory/section-1', 'factory/section-3', 'factory/stair'],
    groups: [
      {
        label: 'Texts', count: '3', href: '/factory/', win: ['factory/section-1', 'jewellery/hero', 'bags/hero'], cap: 'T01 · T02 · T03',
        children: [
          { label: 'Tectonics without origin', href: '/factory/tectonics-without-origin/', sheet: '13', win: ['factory/section-1', 'factory/stair', 'factory/section-3'], cap: 'T01 // profile' },
          { label: 'Ordinary Objects', href: '/factory/ordinary-objects/', sheet: '14', win: ['jewellery/hero', 'scan/OB-021', 'jewellery/BR-B'], cap: 'T02 // ordinary object' },
          { label: 'Bag / Profile Series', href: '/factory/bag-profile-series/', coming: true, win: ['bags/hero', 'bags/BG-114'], cap: 'T03 ( ) in work' }
        ]
      },
      {
        label: 'Theses', count: '2 of n', href: '/factory/#theses', win: ['factory/section-1', 'jewellery/BR-A'], cap: 'T01 · T02',
        children: [
          { label: 'T01 // profile', href: '/factory/#t01', win: ['bags/BG-114', 'fashion/JK-001', 'factory/section-2'], cap: 'Fashion · Bags' },
          { label: 'T02 // ordinary object', href: '/factory/#t02', win: ['jewellery/BR-A', 'scan/OB-011', 'scan/OB-021'], cap: 'Jewellery · Scan Series' },
          { label: 'T03 ( )  T04 ( )', href: '/factory/#theses', coming: true }
        ]
      },
      { label: 'Glossary', href: '/factory/glossary/', win: ['factory/section-4', 'factory/section-2'], cap: 'F · A · S' },
      { label: 'Publishing', href: '/factory/publishing/', win: ['factory/section-3', 'factory/section-1'] },
      { label: 'Archive', href: '/factory/archive/', win: ['factory/section-2', 'factory/section-4'] }
    ]
  },
  {
    id: 'atelier', letter: 'A', label: 'Atelier', verb: 'to make', href: '/atelier/', sheet: '03', enter: 'Enter the Atelier',
    line: 'The workshop. Everything here is cut, cast or printed — and everything here can be bought.',
    win: ['fashion/JK-001', 'bags/BG-114', 'jewellery/BR-A', 'scan/OB-011'],
    groups: [
      {
        label: 'Fashion', count: '18', href: '/atelier/fashion/', sheet: '04', win: ['fashion/SH-001', 'fashion/JK-004', 'fashion/TR-002', 'fashion/VT-001'], cap: 'SH / 001 · JK / 004 · TR / 002 · VT / 001',
        inline: [{ label: 'Jackets ( 8 )', href: '/atelier/fashion/#jackets' }, { label: 'Shirts ( 4 )', href: '/atelier/fashion/#shirts' }, { label: 'Trousers ( 3 )', href: '/atelier/fashion/#trousers' }, { label: 'Vests ( 3 )', href: '/atelier/fashion/#vests' }],
        children: [{ label: 'SH / 001  shirt, grey band', href: '/atelier/fashion/sh-001/', sheet: '05', win: ['fashion/SH-001', 'fashion/SH-001-2', 'fashion/SH-001-3'], cap: 'SH / 001' }]
      },
      {
        label: 'Bag / Profile Series', href: '/atelier/bags/', sheet: '06', win: ['bags/BG-114', 'bags/BG-098', 'bags/BG-086', 'bags/BG-NEW'], cap: 'BG / 114 · 098 · 086',
        children: [{ label: 'BG / 114  tote', href: '/atelier/bags/bg-114/', sheet: '07', win: ['bags/BG-114', 'bags/BG-114-2'], cap: 'BG / 114' }]
      },
      {
        label: 'Jewellery', href: '/atelier/jewellery/', sheet: '08', win: ['jewellery/BR-A', 'jewellery/BR-B', 'jewellery/BR-C', 'jewellery/BR-D'], cap: 'BR / 0??.a – d',
        children: [{ label: 'BR / 0??.a  cuff', href: '/atelier/jewellery/br-a/', sheet: '09', win: ['jewellery/BR-A', 'jewellery/BR-A-2'], cap: 'BR / 0??.a' }]
      },
      {
        label: 'Scan Series', href: '/atelier/scan-series/', sheet: '10', win: ['scan/OB-011', 'scan/OB-021', 'scan/OB-031', 'scan/OB-034'], cap: 'OB / 011 · 021 · 031 · 034',
        children: [{ label: 'OB / 011  vase, blue', href: '/atelier/scan-series/ob-011/', sheet: '11', win: ['scan/OB-011', 'scan/OB-011-2'], cap: 'OB / 011' }]
      },
      { label: 'Furniture ( )', href: '/atelier/furniture/', coming: true, sub: '( )' }
    ]
  },
  {
    id: 'studio', letter: 'S', label: 'Studio', verb: 'to enter', href: '/studio/', sheet: '15', enter: 'Enter the Studio',
    line: 'The space. The works are for sale: the original, and two print editions.',
    win: ['art/CI-07', 'art/LP-02-2', 'art/CI-detail'],
    groups: [
      {
        label: 'Conceptual Interference', href: '/studio/conceptual-interference/', sheet: '16', win: ['art/CI-07', 'art/CI-03', 'art/CI-11', 'art/CI-14'], cap: 'CI / 07 · 03 · 11 · 14',
        children: [
          { label: 'CI / 07  original & prints', href: '/studio/conceptual-interference/ci-07/', sheet: '22', win: ['art/CI-07', 'art/CI-detail'], cap: 'CI / 07' },
          { label: 'All fifteen plates', href: '/studio/conceptual-interference/#all', win: ['art/CI-01', 'art/CI-05', 'art/CI-09', 'art/CI-14'] }
        ]
      },
      {
        label: 'Layer Paintings', href: '/studio/layer-paintings/', sheet: '17', win: ['art/LP-02-1', 'art/LP-02-2', 'art/LP-02-3'], cap: 'LP / 02 · three states',
        children: [
          { label: 'LP / 02  triptych & prints', href: '/studio/layer-paintings/lp-02/', sheet: '23', win: ['art/LP-02-1', 'art/LP-02-2', 'art/LP-02-3'], cap: 'LP / 02' },
          { label: 'Choose a state  ·  poster, archival', href: '/studio/layer-paintings/lp-02/#states', win: ['art/LP-02-2', 'art/LP-01-2', 'art/LP-04-3'] }
        ]
      },
      { label: 'Exhibitions', href: '/studio/exhibitions/', win: ['art/CI-detail', 'art/LP-detail'] },
      { label: 'Sound', href: '/studio/sound/', win: ['art/LP-detail', 'art/CI-detail-2'] },
      { label: 'Scenography ( )', href: '/studio/scenography/', coming: true, sub: '( )' },
      { label: 'Architecture ( )', href: '/studio/architecture/', coming: true, sub: '( )' }
    ]
  }
];

export const MENU_BOTTOM = {
  campaigns: [
    { label: '( 01 ) [ campaign title ]', href: '/campaigns/01/' },
    { label: '( 02 ) The objects, at home', href: '/campaigns/02/' },
    { label: '( 03 ) ( )', href: '/campaigns/', coming: true }
  ],
  about: [{ label: 'One sign, three rooms', href: '/about/' }, { label: 'Contact', href: '/contact/' }, { label: 'Press', href: '/press/' }],
  bag: [{ label: 'Checkout', href: '/bag/' }, { label: 'Search', href: '#search' }, { label: 'English', href: '#' }]
};

export const FOOTER = {
  service: [{ label: 'Contact', href: '/contact/' }, { label: 'Shipping', href: '/shipping/' }, { label: 'Returns', href: '/returns/' }, { label: 'FAQ', href: '/faq/' }],
  company: [{ label: 'About', href: '/about/' }, { label: 'Campaigns', href: '/campaigns/' }, { label: 'Journal', href: '/journal/' }, { label: 'Imprint', href: '/imprint/' }],
  follow: [{ label: 'Instagram', href: 'https://www.instagram.com/' }, { label: 'Newsletter', href: '/#newsletter' }]
};
