import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { toSummary } from '@/lib/products/summary';
import { BagView } from './BagView';

// Default (node) environment: this is the server render, which cannot know what the browser has stored.
describe('BagView on the server', () => {
  it('says it is loading, not that the bag is empty (Ruling P44)', () => {
    const html = renderToString(<BagView products={Object.fromEntries(PRODUCTS.map((p) => [p.id, toSummary(p)]))} />);
    expect(html).toContain('Loading your bag …');
    expect(html).not.toContain('Your bag is empty.');
  });
});
