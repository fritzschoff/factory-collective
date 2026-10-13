import metrics from './font-metrics.json';

/**
 * The long-form sign  C ONCEPT. ( WORD ) C OLLECTIVE .  measured in Archivo Black.
 * All values in em of the sign's font size (scripts/measure-font.py produced the JSON).
 */
const ADV = metrics.advEm as Record<string, number>;
const WORDS = metrics.words as Record<string, number>;
const B = metrics.bracket;

/** Advances of the nine pieces, in the order the JSON lists them: C · ONCEPT · . · ( · ATELIER · ) · C · OLLECTIVE · . */
export const signAdvances = (): number[] => Object.values(ADV);

export interface SignGeometry {
  /** total advance in em */
  tot: number;
  /** fractions of the sign width: the F, A and S axes and the two brackets */
  xF: number; xA: number; xS: number; brL: number; brR: number;
  /** left edge of the window, fraction of the width */
  winLeft: number;
}

const advOf = (word: string) => WORDS[word.toUpperCase()] ?? ADV.ATELIER;
const BEFORE = ADV.C + ADV.ONCEPT + ADV['. '];

export function signGeometry(word = 'ATELIER'): SignGeometry {
  const w = advOf(word);
  const tot = Object.values(ADV).reduce((a, c) => a + c, 0) - ADV.ATELIER + w;
  const half = ADV['('] / 2;
  return {
    tot,
    winLeft: (BEFORE + half) / tot,
    xF: 0.36 / tot,
    xA: (BEFORE + (ADV['('] + w + ADV[')']) / 2) / tot,
    xS: (BEFORE + ADV['('] + w + ADV[')'] + ADV[' C'] - 0.36) / tot,
    brL: (BEFORE + half) / tot,
    brR: (BEFORE + ADV['('] + w + ADV[')'] / 2) / tot,
  };
}

/** The header's sign row has .55 % of the width as padding on each side; the sign fills the other 98.9 %. */
export const HEADER_PAD_EM = (0.55 * signGeometry().tot) / 98.9;

export interface WindowShape {
  /** viewBox of the sign row in em, including the side padding */
  viewBox: string;
  /** white row with the window cut out — use with fill-rule="evenodd" */
  d: string;
}

/**
 * The sign row as a white band with the window between the brackets cut out.
 * `bleedEm` widens the hole a little under the red glyphs so no white seam can show.
 */
export function windowShape(word = 'ATELIER', padEm = HEADER_PAD_EM, bleedEm = 0.012): WindowShape {
  const w = advOf(word);
  const H = B.inkHeightEm;
  const top = metrics.baselineFromTopEm + B.inkTopFromBaselineEm;
  const innerL = BEFORE + B.left.innerAtMidEm;
  const innerR = BEFORE + ADV['('] + w + B.right.innerAtMidEm;
  const n = (v: number) => Number(v.toFixed(4)).toString();
  const left = B.rows.map((r, i) => [innerL + B.kLeft[i] * H - bleedEm, top + r * H] as const);
  const right = B.rows.map((r, i) => [innerR + B.kRight[i] * H + bleedEm, top + r * H] as const).reverse();
  const hole = [...left, ...right].map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)} ${n(y)}`).join(' ');
  const x0 = -padEm;
  const width = signGeometry(word).tot + 2 * padEm;
  return { viewBox: `${n(x0)} 0 ${n(width)} 1`, d: `M${n(x0)} 0 H${n(x0 + width)} V1 H${n(x0)} Z ${hole} Z` };
}
