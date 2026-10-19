import { afterEach, describe, expect, it, vi } from 'vitest';
import { staticPage } from '@/content/pages';
import { pageMetadata, siteUrl } from './seo';

afterEach(() => vi.unstubAllEnvs());

/** Sets the four variables siteUrl reads; the ones not given are unset. */
function env(vars: { SITE_URL?: string; VERCEL_ENV?: string; VERCEL_PROJECT_PRODUCTION_URL?: string; VERCEL_URL?: string }) {
  for (const key of ['SITE_URL', 'VERCEL_ENV', 'VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL_URL'] as const) vi.stubEnv(key, vars[key]);
}

// Ruling P49: SITE_URL → the production domain on a production deployment → the deployment's own address → localhost
describe('siteUrl', () => {
  it('takes SITE_URL first, on Vercel too', () => {
    env({ SITE_URL: 'https://www.example.com', VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'cfc.vercel.app', VERCEL_URL: 'cfc-abc123.vercel.app' });
    expect(siteUrl()).toBe('https://www.example.com');
  });
  it('without SITE_URL, a production deployment uses the production domain of the project', () => {
    env({ VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'cfc.vercel.app', VERCEL_URL: 'cfc-abc123.vercel.app' });
    expect(siteUrl()).toBe('https://cfc.vercel.app');
  });
  it('without SITE_URL, any other deployment uses its own address', () => {
    env({ VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'cfc.vercel.app', VERCEL_URL: 'cfc-git-branch.vercel.app' });
    expect(siteUrl()).toBe('https://cfc-git-branch.vercel.app');
  });
  it('off Vercel and without SITE_URL, localhost', () => {
    env({});
    expect(siteUrl()).toBe('http://localhost:3000');
    env({ SITE_URL: '' });
    expect(siteUrl()).toBe('http://localhost:3000');
  });
  it('drops a trailing slash', () => {
    env({ SITE_URL: 'https://example.org/' });
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
