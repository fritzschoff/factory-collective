// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState, type ReactNode } from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { useDialog } from './use-dialog';

// jsdom has no layout, so offsetParent is always null. Give elements their parent as offsetParent,
// and null inside a [hidden] ancestor, so the focus trap sees the elements a browser would show.
const realOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() {
      const el = this as HTMLElement;
      return el.closest('[hidden]') ? null : el.parentElement;
    },
  });
});
afterAll(() => {
  if (realOffsetParent) Object.defineProperty(HTMLElement.prototype, 'offsetParent', realOffsetParent);
});

function Harness({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => { onClose(); setOpen(false); };
  useDialog(ref, open, close);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open</button>
      <div ref={ref} hidden={!open}><button type="button">Inside</button></div>
    </>
  );
}

function Panel({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, true, onClose);
  return <div ref={ref}>{children}</div>;
}

describe('useDialog', () => {
  it('moves focus in, closes on Esc, locks the page, gives focus back', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const trigger = screen.getByText('Open');
    trigger.focus();
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(screen.getByText('Inside'));
    expect(document.body.classList.contains('is-locked')).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.body.classList.contains('is-locked')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
});

describe('useDialog focus trap', () => {
  it('starts on the first element in the tab order, skipping a hidden one', () => {
    render(
      <Panel onClose={() => {}}>
        <div hidden><button type="button">Hidden</button></div>
        <button type="button">Visible</button>
      </Panel>,
    );
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Visible' }));
  });

  it('Tab on the last element goes to the first; Shift+Tab on the first goes to the last', () => {
    render(
      <Panel onClose={() => {}}>
        <button type="button">A</button>
        <button type="button">B</button>
        <button type="button">C</button>
      </Panel>,
    );
    screen.getByText('C').focus();
    expect(fireEvent.keyDown(document, { key: 'Tab' })).toBe(false);
    expect(document.activeElement).toBe(screen.getByText('A'));
    expect(fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(screen.getByText('C'));
  });

  it('Tab with focus outside the dialog moves it inside', () => {
    render(
      <>
        <button type="button">Outside</button>
        <Panel onClose={() => {}}>
          <button type="button">A</button>
          <button type="button">B</button>
        </Panel>
      </>,
    );
    screen.getByText('Outside').focus();
    expect(fireEvent.keyDown(document, { key: 'Tab' })).toBe(false);
    expect(document.activeElement).toBe(screen.getByText('A'));
  });

  it('skips disabled elements and elements outside the tab order when wrapping', () => {
    render(
      <Panel onClose={() => {}}>
        <button type="button">A</button>
        <button type="button">B</button>
        <input aria-label="Locked" disabled />
        <button type="button" tabIndex={-1}>Not in tab order</button>
      </Panel>,
    );
    screen.getByText('B').focus();
    expect(fireEvent.keyDown(document, { key: 'Tab' })).toBe(false);
    expect(document.activeElement).toBe(screen.getByText('A'));
    expect(fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(screen.getByText('B'));
  });

  it('a new inline onClose on re-render keeps focus and the lock; Esc calls the latest one', () => {
    const first = vi.fn();
    const latest = vi.fn();
    const fields = (
      <>
        <input aria-label="Name" />
        <input aria-label="Message" />
      </>
    );
    const { rerender } = render(<Panel onClose={first}>{fields}</Panel>);
    const message = screen.getByLabelText('Message');
    message.focus();
    rerender(<Panel onClose={() => latest()}>{fields}</Panel>);
    expect(document.activeElement).toBe(message);
    expect(document.body.classList.contains('is-locked')).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(latest).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });
});
