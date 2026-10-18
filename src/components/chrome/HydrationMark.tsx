'use client';

import { useEffect } from 'react';

/**
 * Renders nothing. Once React has hydrated the page it sets `data-hydrated` on <html>: the server HTML never has it.
 * End-to-end tests wait for it (e2e/ready.ts), because a button pressed before hydration does nothing, and a controlled
 * input changed before hydration keeps a value React does not know.
 */
export function HydrationMark() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = '1';
  }, []);
  return null;
}
