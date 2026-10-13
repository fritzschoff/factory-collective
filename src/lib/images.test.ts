import { afterEach, describe, expect, it, vi } from 'vitest';
import { imageMode, resolveSlot } from './images';

const files = { 'fashion/JK-001': '/images/fashion/JK-001.jpg' };

describe('resolveSlot', () => {
  it('prefers a real picture', () => {
    expect(resolveSlot('fashion/JK-001', 'local', files)).toEqual({ slot: 'fashion/JK-001', source: 'local', src: '/images/fashion/JK-001.jpg' });
  });
  it('falls back to the sample picture', () => {
    expect(resolveSlot('fashion/SH-001', 'local', files)).toEqual({ slot: 'fashion/SH-001', source: 'sample', src: '/images/_sample/camp2/sh_grey_band.jpg' });
  });
  it('never uses samples in strict mode', () => {
    expect(resolveSlot('fashion/SH-001', 'strict', files).source).toBe('none');
  });
  it('placeholders mode ignores even real pictures', () => {
    expect(resolveSlot('fashion/JK-001', 'placeholders', files).src).toBeNull();
  });
  it('slots without any picture are placeholders', () => {
    expect(resolveSlot('studio/exhibition-1', 'local', files).source).toBe('none');
  });
});

describe('imageMode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads the mode from IMAGES', () => {
    vi.stubEnv('IMAGES', 'strict');
    expect(imageMode()).toBe('strict');
    vi.stubEnv('IMAGES', '');
    expect(imageMode()).toBe('local');
  });
  it('takes an explicit mode as given and falls back to local', () => {
    expect(imageMode('strict')).toBe('strict');
    expect(imageMode('placeholders')).toBe('placeholders');
    expect(imageMode('nonsense')).toBe('local');
  });
});
