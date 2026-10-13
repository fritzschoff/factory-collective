/** Joins truthy class names: cx('a', false && 'b', 'c') → 'a c'. */
export const cx = (...names: (string | false | null | undefined)[]): string => names.filter(Boolean).join(' ');
