import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildManifest } from './images-manifest.mjs';

const DIR = path.resolve('public/images');

describe('image manifest', () => {
  it('maps slot keys to public URLs and skips samples and non-images', () => {
    const files = ['fashion/JK-001.jpg', '_sample/camp2/jk_white.jpg', 'notes.txt', 'art/CI-07.webp'].map((f) => path.join(DIR, f));
    expect(buildManifest(files)).toEqual({ slots: { 'art/CI-07': '/images/art/CI-07.webp', 'fashion/JK-001': '/images/fashion/JK-001.jpg' } });
  });

  it('keeps the jpeg when the same slot also has a later extension', () => {
    const files = ['fashion/JK-001.webp', 'fashion/JK-001.jpg'].map((f) => path.join(DIR, f));
    expect(buildManifest(files).slots['fashion/JK-001']).toBe('/images/fashion/JK-001.jpg');
  });
});
