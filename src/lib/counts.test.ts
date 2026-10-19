import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { createCatalog } from '@/lib/data/catalog';
import { labelled, paren, pieces, workCount, workPanels } from './counts';

describe('catalogue counts', () => {
  it('counts active pieces in a series and a group', () => {
    const cat = createCatalog(PRODUCTS);
    expect(labelled('Jackets', pieces(cat, 'fashion', 'jackets'))).toBe('Jackets ( 8 )');
    expect(paren(pieces(cat, 'fashion'))).toBe('( 18 )');
    expect(workCount('ci')).toBe(15);
    expect(workPanels('lp')).toBe(12);
  });

  it('a piece leaving the shop changes the number on the page', () => {
    const cat = createCatalog(PRODUCTS.map((product) => product.id === 'JK-001' ? { ...product, status: 'archived' as const } : product));
    expect(pieces(cat, 'fashion', 'jackets')).toBe(7);
    expect(labelled('Fashion', pieces(cat, 'fashion'))).toBe('Fashion ( 17 )');
  });
});