import { describe, expect, it } from 'vitest';
import { MAX_QTY, addLine, countItems, lineKey, parseBag, setQty } from './items';

const white = { colour: { v: 'white', l: 'White' }, size: { v: '50', l: '50' } };

describe('bag lines', () => {
  it('one line per product and options, options sorted', () => {
    expect(lineKey('JK-001', { size: { v: '50', l: '50' }, colour: { v: 'white', l: 'White' } })).toBe('JK-001|colour=white&size=50');
  });
  it('adding the same thing again raises the quantity, never beyond 9', () => {
    let items = addLine([], 'JK-001', white, 1);
    items = addLine(items, 'JK-001', white, 20);
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(MAX_QTY);
  });
  it('other options make another line', () => {
    const items = addLine(addLine([], 'JK-001', white), 'JK-001', { ...white, size: { v: '52', l: '52' } });
    expect(items).toHaveLength(2);
    expect(countItems(items)).toBe(2);
  });
  it('quantity 0 removes the line', () => {
    const items = addLine([], 'OB-011', {});
    expect(setQty(items, items[0].key, 0)).toEqual([]);
  });
  it('drops a quantity that is not a whole number', () => {
    const items = addLine([], 'OB-011', {});
    expect(addLine(items, 'JK-001', white, Number.NaN)).toBe(items);
    expect(addLine(items, 'JK-001', white, -2)).toBe(items);
    expect(addLine(items, 'JK-001', white, 1.5)).toBe(items);
    expect(setQty(items, items[0].key, Number.NaN)).toBe(items);
    expect(setQty(items, items[0].key, 1.5)).toBe(items);
  });
});

describe('parseBag', () => {
  it('survives garbage', () => {
    expect(parseBag('{not json')).toEqual([]);
    expect(parseBag('{"a":1}')).toEqual([]);
    expect(parseBag(null)).toEqual([]);
  });
  it('keeps the valid lines, repairs keys, drops the rest', () => {
    const raw = JSON.stringify([
      { key: 'stale', id: 'JK-001', qty: 2, opts: { size: { v: '50', l: '50' }, bad: 7 } },
      { id: 42, qty: 1 },
      { id: 'OB-011', qty: 0 },
      { id: 'OB-011', qty: 30, opts: null },
    ]);
    expect(parseBag(raw)).toEqual([
      { key: 'JK-001|size=50', id: 'JK-001', qty: 2, opts: { size: { v: '50', l: '50' } } },
      { key: 'OB-011|', id: 'OB-011', qty: 9, opts: {} },
    ]);
  });
  it('merges lines that repair to the same key', () => {
    const raw = JSON.stringify([
      { id: 'JK-001', qty: 2, opts: { size: { v: '50', l: '50' } } },
      { key: 'other', id: 'JK-001', qty: 3, opts: { size: { v: '50', l: '50' } } },
    ]);
    expect(parseBag(raw)).toEqual([
      { key: 'JK-001|size=50', id: 'JK-001', qty: 5, opts: { size: { v: '50', l: '50' } } },
    ]);
  });
});
