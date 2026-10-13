'use client';

import { useEffect, useEffectEvent, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button, input:not([type=hidden]), select, textarea, [tabindex]';

/** What Tab reaches inside `el`, in order: enabled, in the tab order, and displayed. */
function tabOrder(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (x) => x.tabIndex >= 0 && !x.matches(':disabled') && (x.offsetParent !== null || x === document.activeElement),
  );
}

/** Modal behaviour for an overlay: Esc closes, Tab stays inside, the page does not scroll, focus returns afterwards. */
export function useDialog(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
  initialFocus?: RefObject<HTMLElement | null>,
): void {
  // The latest onClose without re-running the effect: a new inline callback must not move focus.
  const closeLatest = useEffectEvent(onClose);

  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add('is-locked');
    (initialFocus?.current ?? tabOrder(el)[0])?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeLatest(); return; }
      if (e.key !== 'Tab') return;
      const items = tabOrder(el);
      if (!items.length) { e.preventDefault(); return; }
      const last = items.length - 1;
      const index = items.findIndex((x) => x === document.activeElement);
      // Focus outside the dialog (or on its frame) enters it: Tab at the start, Shift+Tab at the end.
      let next: HTMLElement | undefined;
      if (index === -1) next = items[e.shiftKey ? last : 0];
      else if (e.shiftKey && index === 0) next = items[last];
      else if (!e.shiftKey && index === last) next = items[0];
      if (!next) return;
      e.preventDefault();
      next.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      previous?.focus({ preventScroll: true });
    };
  }, [open, ref, initialFocus]);
}
