// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LinkRow, Room, SecHead } from './blocks';

const way = { label: 'Read the text', soon: 'bagText' } as const;

describe('ways in that are coming soon', () => {
  it('show the label with the empty brackets, then "coming soon" — SecHead (links and read), Room and LinkRow alike', () => {
    const { container } = render(
      <>
        <SecHead kick="k" title="t" text="x" read={way} links={[way]} />
        <Room slot="fashion/JK-001" kick="k" title="t" text="x" href="/atelier/" links={[way]} />
        <LinkRow links={[way]} />
      </>,
    );
    expect([...container.querySelectorAll('.soon')].map((s) => s.textContent)).toEqual(Array(4).fill('Read the text\u00a0(\u00a0)coming soon'));
    expect(container.querySelectorAll('.soon a')).toHaveLength(0);
  });
});
