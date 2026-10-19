import { expect, test } from '@playwright/test';
import { hasAnchor, pageRefs } from '../scripts/page-refs';
import { allPages } from '../src/content/pages';
import { soonPaths } from '../src/content/soon';
import { getCatalog } from '../src/lib/data/catalog';

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

  const imageRefs = new Set<string>();
  let anchorsChecked = 0;

  for (const path of pages) {
    if ((await get(path)) !== 200) { problems.push(`${path} → ${status.get(path)}`); continue; }
    for (const { url, hash } of pageRefs(html.get(path)!)) {
      const target = url || path;
      if (!target.startsWith('/') || target.startsWith('/_next/')) continue;
      if (url) {
        if (soonPaths().some((s) => url.startsWith(s))) problems.push(`${path} links to coming-soon ${url}`);
        const code = await get(url);
        if (code !== 200) problems.push(`${path} → ${url} answers ${code}`);
        if (url.startsWith('/images/')) imageRefs.add(url);
      }
      if (hash && html.has(target)) {
        anchorsChecked++;
        if (!hasAnchor(html.get(target)!, hash)) problems.push(`${path} → ${target}#${hash}: no such anchor`);
      }
    }
  }

  const pictures = [...status].filter(([u, code]) => u.startsWith('/images/') && code === 200);
  const missed = [...imageRefs].filter((url) => status.get(url) !== 200);
  expect(imageRefs.size, 'distinct picture files the pages point at').toBeGreaterThan(0);
  expect(missed, 'picture files that did not answer 200').toEqual([]);
  expect(pictures.length, 'distinct picture files under /images/ that answered 200').toBe(imageRefs.size);
  expect(status.size, 'distinct URLs checked (pages, pictures, links)').toBeGreaterThan(pages.length);
  expect(anchorsChecked, '#anchors checked against their target page').toBeGreaterThanOrEqual(1);
  expect(problems).toEqual([]);
});
