import { afterEach, describe, expect, it, vi } from 'vitest';
import { staticPage } from '@/content/pages';
import { pageMetadata, siteUrl } from './seo';

afterEach(() => vi.unstubAllEnvs());

describe('siteUrl', () => {
  it('falls back to localhost when SITE_URL is unset', () => {
    vi.stubEnv('SITE_URL', undefined);
    expect(siteUrl()).toBe('http://localhost:3000');
  });
  it('drops a trailing slash', () => {
    vi.stubEnv('SITE_URL', 'https://example.org/');
    expect(siteUrl()).toBe('https://example.org');
  });
});

describe('pageMetadata', () => {
  it('gives the home page an absolute title and a canonical address', () => {
    const m = pageMetadata(staticPage('/'));
    expect(m.title).toEqual({ absolute: expect.stringContaining('Concept. ( ) Collective — ') });
    expect(m.alternates).toEqual({ canonical: '/' });
  });
  it('leaves the suffix of other titles to the root template', () => {
    const m = pageMetadata(staticPage('/contact/'));
    expect(m.title).toBe('Contact');
    expect(m.openGraph).toMatchObject({ title: 'Contact — C. ( ) C.', url: '/contact/' });
  });
  it('keeps the bag out of search engines and gives it no canonical address', () => {
    const m = pageMetadata(staticPage('/bag/'));
    expect(m.robots).toEqual({ index: false, follow: true });
    expect(m.alternates).toBeUndefined();
  });
  it('uses the large card only when the page has a picture', () => {
    vi.stubEnv('IMAGES', 'local');
    expect(pageMetadata(staticPage('/atelier/')).twitter).toEqual({ card: 'summary_large_image' });
    expect(pageMetadata(staticPage('/faq/')).twitter).toEqual({ card: 'summary' });
  });
});
