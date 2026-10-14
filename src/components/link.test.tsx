// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { A, isInternal } from './link';

describe('A', () => {
  it('knows which addresses are inside the site', () => {
    const addresses = ['/atelier/', '/', '//cdn.example.com/x.js', 'https://example.com/', 'mailto:studio@example.com', '#main'];
    expect(addresses.map(isInternal)).toEqual([true, true, false, false, false, false]);
  });

  it('keeps mail, other sites and #anchors as plain links, with their attributes', () => {
    render(<><A href="mailto:studio@example.com">Mail</A><A href="https://example.com/" target="_blank" rel="noreferrer">Out</A><A href="#main">Skip</A></>);
    expect(screen.getByRole('link', { name: 'Mail' })).toHaveAttribute('href', 'mailto:studio@example.com');
    expect(screen.getByRole('link', { name: 'Out' })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Skip' })).toHaveAttribute('href', '#main');
  });

  it('passes its props on to the link inside the site', () => {
    render(<A href="/atelier/" className="pill" aria-label="Atelier">Enter</A>);
    const link = screen.getByRole('link', { name: 'Atelier' });
    expect(link).toHaveAttribute('href', '/atelier/');
    expect(link).toHaveClass('pill');
  });
});
