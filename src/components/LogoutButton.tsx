'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSignOut() {
    await fetch('/api/session', { method: 'DELETE' });
    router.refresh();
  }

  return (
    <button
      onClick={() => startTransition(handleSignOut)}
      disabled={isPending}
      className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]"
    >
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
