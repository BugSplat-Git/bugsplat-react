/**
 * Determine if any items in an array have changed.
 * Uses Object.is to perform comparison on each item.
 * @param a
 * @param b
 * @returns
 */
export function isArrayChanged(a: unknown[] = [], b: unknown[] = []) {
  return (
    a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]))
  );
}
