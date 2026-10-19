export interface PageRef { url: string; hash?: string }

export function pageRefs(html: string): PageRef[] {
  const refs: PageRef[] = [];
  const consider = (value: string) => {
    if (!value || /^(?:https?:|data:|mailto:|tel:)/i.test(value)) return;
    let url = value.replace(/&amp;/g, '&');
    let hash = '';
    const hashAt = url.indexOf('#');
    if (hashAt >= 0) { hash = decodeURIComponent(url.slice(hashAt + 1)); url = url.slice(0, hashAt); }
    const queryAt = url.indexOf('?');
    let query = '';
    if (queryAt >= 0) { query = url.slice(queryAt + 1); url = url.slice(0, queryAt); }
    if (url.replace(/\/$/, '') === '/_next/image') url = new URLSearchParams(query).get('url') ?? '';
    if (url && !url.startsWith('/')) return;
    if (!url && !hash) return;
    refs.push(hash ? { url, hash } : { url });
  };
  for (const match of html.matchAll(/\s(?:href|src|xlink:href)=["']([^"']*)["']/gi)) consider(match[1]);
  for (const match of html.matchAll(/url\(\s*["']?(\/[^"')\\\s&]+)["']?\s*\)/gi)) consider(match[1]);
  return refs;
}

export function hasAnchor(html: string, id: string): boolean {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\sid=(?:"${escaped}"|'${escaped}')`).test(html);
}
