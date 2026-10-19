// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithChrome } from '@/test/chrome';
import { useChrome } from './ChromeProvider';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/' }));
import { useInBagToast } from './Toast';

function Toasts() {
  const { showToast } = useChrome();
  return (
    <>
      <button type="button" onClick={() => showToast('SH / 001 // shirt, grey band is in your bag.')}>first</button>
      <button type="button" onClick={() => showToast('BG / 114 // bag, black is in your bag.')}>second</button>
    </>
  );
}

function AddShirt() {
  const inBag = useInBagToast();
  return <button type="button" onClick={() => inBag({ code: 'SH / 001', name: 'shirt, grey band' })}>add</button>;
}

describe('Toast', () => {
  // A live region that is created together with its text is often not read out: the region stays, its text changes.
  it('says every toast in the same live region, which is in the page before the first one', () => {
    renderWithChrome(<Toasts />);
    const region = screen.getByRole('status');
    expect(region).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole('button', { name: 'first' }));
    expect(screen.getByRole('status')).toBe(region);
    expect(region).toHaveTextContent('SH / 001 // shirt, grey band is in your bag.');
    fireEvent.click(screen.getByRole('button', { name: 'second' }));
    expect(screen.getByRole('status')).toBe(region);
    expect(region).toHaveTextContent('BG / 114 // bag, black is in your bag.');
  });

  it('after an Add: names the piece and links to the bag, two no-break spaces before the arrow', () => {
    renderWithChrome(<AddShirt />);
    fireEvent.click(screen.getByRole('button', { name: 'add' }));
    expect(screen.getByRole('status')).toHaveTextContent('SH / 001 // shirt, grey band is in your bag.');
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/bag/');
    expect(link.textContent).toBe('View bag\u00a0\u00a0→');
  });
});
