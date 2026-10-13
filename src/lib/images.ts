import { SAMPLES } from '@/content/samples';
import manifest from '@/generated/image-manifest.json';

export type ImageMode = 'local' | 'strict' | 'placeholders';
export type ImageSource = 'local' | 'sample' | 'none';
export interface ResolvedImage { slot: string; source: ImageSource; src: string | null }

const REAL: Readonly<Record<string, string>> = manifest.slots;

export const imageMode = (value: string | undefined = process.env.IMAGES): ImageMode =>
  value === 'strict' || value === 'placeholders' ? value : 'local';

/**
 * Where the picture of a slot comes from:
 *  1. public/images/<slot>.(jpg|png|webp|avif) — a real picture
 *  2. the sample in public/images/_sample (not with IMAGES=strict)
 *  3. nothing — the placeholder that names the slot
 */
export function resolveSlot(slot: string, mode: ImageMode = imageMode(), files: Readonly<Record<string, string>> = REAL): ResolvedImage {
  if (mode === 'placeholders') return { slot, source: 'none', src: null };
  const local = files[slot];
  if (local) return { slot, source: 'local', src: local };
  const sample = SAMPLES[slot];
  if (sample && mode !== 'strict') return { slot, source: 'sample', src: `/images/_sample/${sample}.jpg` };
  return { slot, source: 'none', src: null };
}

export const slotSrc = (slot: string): string | null => resolveSlot(slot).src;

export const hasRealPictures = (): boolean => Object.keys(REAL).length > 0;
