import type { OptionDef } from '@/lib/types';

/** The value chosen before the buyer touches anything: the middle size, otherwise the first value. */
export const defaultValueIndex = (o: OptionDef): number => {
  const n = o.values?.length ?? 0;
  return o.type === 'size' && n > 2 ? Math.floor(n / 2) : 0;
};
