// @vitest-environment jsdom
import { act, fireEvent, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { toSummary } from '@/lib/products/summary';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/' }));
import { QuickAddButton } from './QuickAdd';

const summary = (id: string) => toSummary({ ...PRODUCTS.find((p) => p.id === id)!, priceCents: 26000 });
const stored = () => JSON.parse(localStorage.getItem('cfc.bag.v1') ?? '[]');

const realOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() { return (this as HTMLElement).closest('[hidden]') ? null : (this as HTMLElement).parentElement; },
  });
});
afterAll(() => { if (realOffsetParent) Object.defineProperty(HTMLElement.prototype, 'offsetParent', realOffsetParent); });

describe('QuickAddButton', () => {
  afterEach(() => localStorage.clear());

  it('asks for the choices first and adds with them', () => {
    renderWithChrome(<QuickAddButton product={summary('SH-001')} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: '52' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(stored()[0]).toMatchObject({ id: 'SH-001', qty: 1, opts: { colour: { v: 'light-grey' }, size: { v: '52' } } });
    expect(screen.getByRole('status')).toHaveTextContent('SH / 001 // shirt, grey band is in your bag.');
  });

  it('prints with a choice of state send you to the work page', () => {
    renderWithChrome(<QuickAddButton product={summary('LP-02.P')} />);
    expect(screen.getByRole('link', { name: 'Choose & add' })).toHaveAttribute('href', '/studio/layer-paintings/lp-02/');
  });

  // The box sits at the end of the page in tab order, so it takes focus when it opens and gives it back when it goes.
  describe('from the keyboard', () => {
    const openBox = () => {
      renderWithChrome(<QuickAddButton product={summary('SH-001')} />);
      const add = screen.getByRole('button', { name: 'Add' });
      act(() => add.focus());
      fireEvent.click(add);
      return add;
    };

    it('opens with focus on the first choice, inside the dialog', () => {
      openBox();
      expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Light grey' }));
    });

    it('Tab stays inside the box, and Shift+Tab from the first choice does not close it', () => {
      openBox();
      const first = screen.getByRole('button', { name: 'Light grey' });
      expect(first).toHaveFocus();
      fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add to bag' })).toHaveFocus();
      fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(first).toHaveFocus();
    });

    it('Escape closes the box and puts focus back on the button', () => {
      const add = openBox();
      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(add).toHaveFocus();
    });

    it('Add to bag closes the box and puts focus back on the button, not on the page', () => {
      const add = openBox();
      const submit = screen.getByRole('button', { name: 'Add to bag' });
      act(() => submit.focus());
      fireEvent.click(submit);
      expect(stored()).toHaveLength(1);
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(add).toHaveFocus();
    });

    it('closes when focus moves on to anything outside the box and its button', () => {
      renderWithChrome(<><QuickAddButton product={summary('SH-001')} /><a href="#elsewhere">elsewhere</a></>);
      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      act(() => screen.getByRole('link', { name: 'elsewhere' }).focus());
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('stays open while focus moves inside the box, back to its button, or to nowhere in particular', () => {
      const add = openBox();
      act(() => screen.getByRole('button', { name: 'Add to bag' }).focus());
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      act(() => add.focus());
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // a press on the padding of the box, or the window losing focus, moves focus to no element at all
      act(() => add.blur());
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('opening a second box closes the first: never two at once', () => {
      renderWithChrome(<><QuickAddButton product={summary('SH-001')} /><QuickAddButton product={summary('JK-001')} /></>);
      const [first, second] = screen.getAllByRole('button', { name: 'Add' });
      fireEvent.click(first);
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
      // arriving at the second button (Tab, or a press) moves focus there; then it is activated
      act(() => second.focus());
      fireEvent.click(second);
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs).toHaveLength(1);
      expect(dialogs[0]).toHaveAccessibleName('Choose and add JK / 001');
    });
  });
});
