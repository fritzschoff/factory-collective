export function specForStore(spec: readonly (readonly [string, string])[]): { label: string; value: string }[] {
  return spec.map(([label, value]) => ({ label, value }));
}

export function specFromStore(spec: unknown): [string, string][] {
  if (!Array.isArray(spec)) return [];
  return spec.flatMap((row) => {
    if (Array.isArray(row) && row.length >= 2) return [[String(row[0]), String(row[1])] as [string, string]];
    if (row && typeof row === 'object' && 'label' in row && 'value' in row) {
      const item = row as { label: unknown; value: unknown };
      return [[String(item.label), String(item.value)] as [string, string]];
    }
    return [];
  });
}
