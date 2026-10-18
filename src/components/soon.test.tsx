// @vitest-environment jsdom
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

// The registry with two entries switched on: bagText has a page, outerwear has none. Every other entry is still coming soon.
vi.mock('@/content/soon', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/content/soon')>();
  const registry = {
    ...real.SOON,
    bagText: { ...real.SOON.bagText, status: 'live' as const },
    outerwear: { ...real.SOON.outerwear, status: 'live' as const },
  };
  return {
    ...real,
    SOON: registry,
    isSoon: (key: keyof typeof registry) => real.isSoon(key, registry),
    soonHref: (key: keyof typeof registry) => real.soonHref(key, registry),
  };
});
import { LinkRow, Rows, SecHead } from '@/components/blocks';
import { Soon } from '@/components/soon';
import { Register } from '@/components/ui';

const PAGE = '/factory/bag-profile-series/';
const hrefs = (root: HTMLElement) => [...root.querySelectorAll('a')].map((a) => a.getAttribute('href'));

describe('coming-soon entries once one of them is live', () => {
  it('Soon becomes a plain link to the page, or plain text when the entry has none', () => {
    const { container } = render(<><Soon k="bagText" className="x" /><Soon k="outerwear">Coats</Soon></>);
    expect(container.querySelector('.soon')).toBeNull();
    expect(hrefs(container)).toEqual([PAGE]);
    expect(container.querySelector('a')).toHaveClass('x');
    expect(container).toHaveTextContent('Bag / Profile SeriesCoats');
  });

  it('the link text of a live entry carries no brackets', () => {
    const way = { label: 'Read the text', soon: 'bagText' as const };
    const { container } = render(<><Soon k="bagText">Read the text</Soon><LinkRow links={[way]} /><SecHead kick="k" title="t" text="x" read={way} /></>);
    expect([...container.querySelectorAll('a')].map((a) => a.textContent)).toEqual(['Read the text', 'Read the text', 'Read the text']);
  });

  it('an entry that is not live yet stays red and unlinked beside it', () => {
    const { container } = render(<Soon k="sound" />);
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('.soon')).toHaveAttribute('data-soon', 'sound');
  });

  it('SecHead and LinkRow link the live entry and keep the others red', () => {
    const links = [{ label: 'Read the text', soon: 'bagText' as const }, { label: 'Sound', soon: 'sound' as const }];
    const { container } = render(<><SecHead kick="k" title="t" text="x" links={links} /><LinkRow links={links} /></>);
    expect(hrefs(container)).toEqual([PAGE, PAGE]);
    expect(container.querySelectorAll('.soon')).toHaveLength(2);
  });

  it('Register and Rows link the live entry and drop the red; a live entry without a page stays plain text', () => {
    const { container } = render(
      <>
        <Register rows={[{ no: '03', name: 'Bag / Profile Series', soon: 'bagText' }, { no: '04', name: 'Outerwear', soon: 'outerwear' }]} />
        <Rows rows={[
          { no: '03', title: 'Bag / Profile Series', meta: 'm', go: 'Read', soon: 'bagText' },
          { no: '04', title: 'Outerwear', meta: 'm', go: 'Read', soon: 'outerwear' },
        ]} />
      </>,
    );
    expect(hrefs(container)).toEqual([PAGE, PAGE, PAGE]);
    expect(container.querySelectorAll('.soon, .is-red')).toHaveLength(0);
  });

  it('Rows never links a row whose entry is still soon, even when it is given an href', () => {
    const { container } = render(<Rows rows={[{ no: '05', title: 'Sound', meta: 'm', go: 'Read', soon: 'sound', href: '/studio/sound/' }]} />);
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('li')).toHaveClass('is-red');
    expect(container.querySelector('.soon')).toHaveAttribute('data-soon', 'sound');
  });
});

describe('the text of an entry that is coming soon', () => {
  const textOf = (ui: ReactElement) => render(ui).container.querySelector('.soon__t')?.textContent;

  it('a plain label gets the empty brackets after it, then "coming soon"', () => {
    const { container } = render(<Soon k="sound">Film</Soon>);
    expect(container).toHaveTextContent('Film ( )coming soon');
  });

  it('the registry label stands in when there is no text, brackets included', () => {
    expect(textOf(<Soon k="sound" />)).toBe('Sound\u00a0(\u00a0)');
  });

  it('text that already shows the brackets does not get a second pair', () => {
    expect(textOf(<Soon k="sound">Film ( )</Soon>)).toBe('Film ( )');
    expect(textOf(<Soon k="sound">( )</Soon>)).toBe('( )');
    expect(textOf(<Soon k="theses" />)).toBe('T03 ( )  T04 ( )');
  });

  it('brackets={false} leaves the text as it is: the markup around it draws them', () => {
    expect(textOf(<Soon k="sound" brackets={false}>Film</Soon>)).toBe('Film');
    expect(textOf(<Soon k="sound" brackets={false} />)).toBe('Sound');
  });

  it('only plain text gets brackets: an element is left as it is', () => {
    expect(textOf(<Soon k="sound"><b>Film</b></Soon>)).toBe('Film');
  });
});
