'use client';

import { useChrome } from '@/components/chrome/ChromeProvider';

/** Opens the enquiry dialog for an original. */
export function EnquireButton({ what, label, className = 'pill' }: { what: string; label: string; className?: string }) {
  const { openEnquiry } = useChrome();
  return <button type="button" className={className} onClick={() => openEnquiry(what)}>{label}</button>;
}
