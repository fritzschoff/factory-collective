/**
 * SAMPLE PICTURES
 * ───────────────
 * Every picture on the site has a SLOT KEY (e.g. `fashion/JK-001`). To use a real photograph, put a file
 * with that name in  public/images/  (fashion/JK-001.jpg) — it wins over everything in this list.
 * This list only says which of the sample photographs (public/images/_sample/…) stand in until then.
 * At launch: set IMAGES=strict (samples are then ignored) and delete public/images/_sample.
 */
export const SAMPLES: Record<string, string> = {};
const add = (slot: string, sample: string) => { SAMPLES[slot] = sample; };

// ── Fashion ────────────────────────────────────────────────
const fashion: Record<string, string> = {
  'JK-001': 'jk_white', 'JK-002': 'jk_stone', 'JK-003': 'jk_black_funnel', 'JK-004': 'jk_pinstripe',
  'JK-005': 'jk_navy', 'JK-006': 'jk_grey_collar', 'JK-007': 'jk_black_collar', 'JK-008': 'jk_bluegrey',
  'SH-001': 'sh_grey_band', 'SH-002': 'sh_chambray', 'SH-003': 'sh_grey_rail', 'SH-004': 'ss_olive_metal',
  'TR-001': 'tr_charcoal', 'TR-002': 'tr_lightgrey', 'TR-003': 'tr_black',
  'VT-001': 'vt_black_diag', 'VT-002': 'vt_black_blue', 'VT-003': 'sl_grey_sit'
};
for (const [id, f] of Object.entries(fashion)) add(`fashion/${id}`, `camp2/${f}`);
add('fashion/SH-001-2', 'camp2/sh_grey_rail'); add('fashion/SH-001-3', 'camp2/sh_grey_stairs'); add('fashion/SH-001-4', 'camp2/sh_chambray');
add('fashion/JK-001-2', 'camp2/jk_stone'); add('fashion/TR-001-2', 'camp2/tr_black_sit'); add('fashion/VT-001-2', 'camp2/vt_black_blue');
add('fashion/hero-1', 'camp2/jk_white'); add('fashion/hero-2', 'camp2/sh_grey_stairs');
add('fashion/break', 'camp2/sl_grey_back');

// ── Bags ───────────────────────────────────────────────────
add('bags/BG-114', 'new/bg114'); add('bags/BG-098', 'new/bg098'); add('bags/BG-086', 'new/bg086'); add('bags/BG-NEW', 'new/bgnew');
add('bags/BG-114-2', 'new/bg098'); add('bags/BG-114-3', 'new/bg086'); add('bags/BG-114-4', 'camp2/jk_black_funnel');
add('bags/hero', 'new/bgnew'); add('bags/carried', 'camp2/jk_black_funnel');
add('bags/section', 'art/arch3');

// ── Jewellery ──────────────────────────────────────────────
add('jewellery/BR-A', 'new/j_cuff1'); add('jewellery/BR-B', 'new/j_screw'); add('jewellery/BR-C', 'new/j_spring1');
add('jewellery/BR-D', 'new/j_ring'); add('jewellery/BR-E', 'new/j_chain');
add('jewellery/BR-A-2', 'new/j_cuff2'); add('jewellery/BR-A-3', 'new/j_cuff1'); add('jewellery/BR-A-4', 'new/j_screw');
add('jewellery/BR-C-2', 'new/j_spring2');
add('jewellery/hero', 'new/j_cuff2'); add('jewellery/exploded', 'new/j_cuff2');

// ── Scan Series ────────────────────────────────────────────
const scan: Record<string, string> = {
  'OB-011': 'sc_vase1', 'OB-012': 'sc_bottle', 'OB-013': 'sc_figure',
  'OB-021': 'sc_box1', 'OB-022': 'sc_box3', 'OB-023': 'sc_box4', 'OB-024': 'sc_box5', 'OB-025': 'sc_box2',
  'OB-031': 'sc_holder1', 'OB-032': 'sc_spike', 'OB-033': 'sc_slab2', 'OB-037': 'sc_slab',
  'OB-034': 'sc_tray', 'OB-035': 'sc_dish', 'OB-036': 'sc_knot'
};
for (const [id, f] of Object.entries(scan)) add(`scan/${id}`, `obj/${f}`);
add('scan/OB-011-2', 'life/sc_life_window'); add('scan/OB-011-3', 'life/sc_life_shelf'); add('scan/OB-011-4', 'obj/sc_bottle');
add('scan/life-garden', 'life/sc_life_garden'); add('scan/life-window', 'life/sc_life_window'); add('scan/life-shelf', 'life/sc_life_shelf');
add('scan/life-desk', 'life/sc_life_desk'); add('scan/life-music', 'life/sc_life_music');

// ── Studio: Conceptual Interference ────────────────────────
for (let i = 1; i <= 15; i++) add(`art/CI-${String(i).padStart(2, '0')}`, `art/ci${String(i).padStart(2, '0')}`);
add('art/CI-detail', 'art/ci_det'); add('art/CI-detail-2', 'art/ci_det2');
// ── Studio: Layer Paintings (three states each) ────────────
for (let w = 1; w <= 4; w++) for (let s = 1; s <= 3; s++) add(`art/LP-0${w}-${s}`, `art/lp${w}_${s}`);
add('art/LP-detail', 'art/lp_det');
add('studio/hero-ci', 'art/ci07'); add('studio/hero-lp', 'art/lp2_2');

// ── Factory ────────────────────────────────────────────────
add('factory/section-1', 'art/arch1'); add('factory/section-2', 'art/arch2'); add('factory/section-3', 'art/arch3'); add('factory/section-4', 'art/arch4');
add('factory/stair', 'camp2/sh_grey_stairs');

// ── Campaigns ──────────────────────────────────────────────
add('home/hero-1', 'new/c_white'); add('home/hero-2', 'new/c_grey');
add('campaign-01/cover', 'new/c_white'); add('campaign-01/cover-2', 'new/c_grey');
add('campaign-01/look-01', 'camp2/sl_grey_back'); add('campaign-01/look-02', 'camp2/jk_white'); add('campaign-01/look-03', 'camp2/jk_black_funnel');
add('campaign-01/look-04', 'camp2/sh_grey_band'); add('campaign-01/look-06', 'camp2/vt_black_diag'); add('campaign-01/look-08', 'camp2/tr_black_sit');
add('campaign-01/look-09', 'camp2/sh_grey_stairs'); add('campaign-01/look-10', 'camp2/jk_navy'); add('campaign-01/look-11', 'camp2/tr_lightgrey_orange');
add('campaign-01/look-12', 'camp2/ss_olive_stairs'); add('campaign-01/look-13', 'camp2/ts_white'); add('campaign-01/look-14', 'camp2/ss_black');
add('campaign-02/cover', 'life/sc_life_garden'); add('campaign-02/life-1', 'life/sc_life_window'); add('campaign-02/life-2', 'life/sc_life_shelf');
add('campaign-02/life-3', 'life/sc_life_desk'); add('campaign-02/life-4', 'life/sc_life_music'); add('campaign-02/life-5', 'life/sc_life_garden');
