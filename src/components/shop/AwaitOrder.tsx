'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getApi } from '@/lib/api';

const TRIES = 8;
const EVERY_MS = 1500;

/**
 * Stripe sends the buyer back before its webhook has always booked the order. Until the order exists the thank-you
 * page asks again every 1.5 s (12 s at most) and, once it is there, renders the page anew: order lines, empty bag.
 */
export function AwaitOrder({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  useEffect(() => {
    let stop = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const ask = async () => {
      tries += 1;
      try {
        await getApi('order', { session_id: sessionId });
        if (!stop) router.refresh();
        return;
      } catch {
        if (!stop && tries < TRIES) timer = setTimeout(ask, EVERY_MS);
      }
    };
    timer = setTimeout(ask, EVERY_MS);
    return () => { stop = true; clearTimeout(timer); };
  }, [router, sessionId]);
  return null;
}
