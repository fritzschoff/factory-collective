export type WorldId = 'factory' | 'atelier' | 'studio' | 'campaigns' | 'about';
export const WORLD_IDS: readonly WorldId[] = ['factory', 'atelier', 'studio', 'campaigns', 'about'];

/** Which room a path belongs to; /contact/ belongs to About. */
export function worldOf(pathname: string | null): WorldId | null {
  const first = (pathname ?? '/').split('/')[1] ?? '';
  if (first === 'contact') return 'about';
  return (WORLD_IDS as readonly string[]).includes(first) ? (first as WorldId) : null;
}
