import { useSyncExternalStore } from 'react';

const subscribeNoop = () => () => {};

/**
 * false in the server HTML and while the page hydrates, true from the first render after it. Until then a button does
 * nothing and a form would be sent natively, so every submit / Add button stays disabled (Ruling P53).
 */
export const useHydrated = (): boolean => useSyncExternalStore(subscribeNoop, () => true, () => false);
