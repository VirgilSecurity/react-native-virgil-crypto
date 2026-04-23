export function toArray<T>(val: T | T[] | null | undefined): T[] {
  if (val == null) {
    return [];
  }

  return Array.isArray(val) ? val : [val];
}
