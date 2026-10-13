export const nbsp = ' ';
export function fmtPrice(cents: number | null | undefined, currency = 'EUR'): string {
  if (cents == null) return '€ [price]';
  const v = cents / 100;
  const s = new Intl.NumberFormat('en-IE', { style: 'currency', currency, minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(v);
  return s.replace(/^€(\d)/, '€ $1');
}
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const word = (n: number) => WORDS[n] ?? String(n);
export const Word = (n: number) => { const w = word(n); return w[0].toUpperCase() + w.slice(1); };
export const pad = (n: number, l = 2) => String(n).padStart(l, '0');
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** '2026-10-13' → '13.10.2026', the date of the title blocks; anything else → ''. */
export function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : '';
}
