// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useDialog } from './use-dialog';

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
