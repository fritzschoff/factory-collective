import { afterEach, describe, expect, it, vi } from 'vitest';
import { storageBucket } from './images-admin';

describe('storage bucket', () => {
  afterEach(() => { vi.unstubAllEnvs(); });

  it('takes the default bucket Cloud Functions name in FIREBASE_CONFIG', () => {
    vi.stubEnv('FIREBASE_STORAGE_BUCKET', '');
    vi.stubEnv('STORAGE_BUCKET', '');
    vi.stubEnv('FIREBASE_CONFIG', JSON.stringify({ projectId: 'shop', storageBucket: 'shop.firebasestorage.app' }));
    expect(storageBucket()).toBe('shop.firebasestorage.app');
  });

  it('falls back to the project bucket when nothing names one', () => {
    vi.stubEnv('FIREBASE_STORAGE_BUCKET', '');
    vi.stubEnv('STORAGE_BUCKET', '');
    vi.stubEnv('FIREBASE_CONFIG', 'not json');
    vi.stubEnv('GCLOUD_PROJECT', 'shop');
    expect(storageBucket()).toBe('shop.appspot.com');
  });
});
