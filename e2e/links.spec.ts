import { expect, test } from '@playwright/test';
import { allPages } from '../src/content/pages';
import { soonPaths } from '../src/content/soon';
import { getCatalog } from '../src/lib/data/catalog';

/** href / src values of a page that point into the site — path plus anchor; query strings are dropped. */
function internalRefs(html: string): { url: string; hash?: string }[] {
  return [...html.matchAll(/\s(?:href|src)="(\/[^"#?]*)(\?[^"#]*)?(#[^"]*)?"/g)].map((m) => {
    // next/image: check the picture file itself, not the optimiser (trailingSlash makes the optimiser path "/_next/image/")
    if (m[1].replace(/\/$/, '') === '/_next/image') return { url: new URLSearchParams((m[2] ?? '').slice(1).replace(/&amp;/g, '&')).get('url') ?? '' };
    return { url: m[1], hash: m[3]?.slice(1) };
  });
}

test('every internal link and picture of every page answers 200, no redirects, no coming-soon targets', async ({ request }) => {
  test.setTimeout(600_000);
  const pages = allPages(await getCatalog()).map((p) => p.path);
  const status = new Map<string, number>();
  const html = new Map<string, string>();
  const problems: string[] = [];
  const get = async (url: string): Promise<number> => {
    if (!status.has(url)) {
      const res = await request.get(url, { maxRedirects: 0 });
      status.set(url, res.status());
      if (res.status() === 200 && url.endsWith('/')) html.set(url, await res.text());
    }
    return status.get(url)!;
  };

  const hasId = (page: string, id: string) => new RegExp(`\\sid="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(html.get(page)!);
  let anchorsChecked = 0;

  for (const path of pages) {
    if ((await get(path)) !== 200) { problems.push(`${path} → ${status.get(path)}`); continue; }
    for (const { url, hash } of internalRefs(html.get(path)!)) {
      if (!url || url.startsWith('/_next/')) continue;
      if (soonPaths().some((s) => url.startsWith(s))) problems.push(`${path} links to coming-soon ${url}`);
      const code = await get(url);
      if (code !== 200) problems.push(`${path} → ${url} answers ${code}`);
      else if (hash && html.has(url)) {
        anchorsChecked++;
        if (!hasId(url, hash)) problems.push(`${path} → ${url}#${hash}: no such anchor`);
      }
    }
  }

  // A crawl that found nothing to check passes just as well as one that found everything fine: prove it did real work.
  const pictures = [...status].filter(([u, code]) => u.startsWith('/images/') && code === 200);
  expect(pictures.length, 'distinct picture files under /images/ that were fetched').toBeGreaterThanOrEqual(80);
  expect(status.size, 'distinct URLs checked (pages, pictures, links)').toBeGreaterThan(pages.length);
  expect(anchorsChecked, '#anchors checked against their target page').toBeGreaterThanOrEqual(1);
  expect(problems).toEqual([]);
});
