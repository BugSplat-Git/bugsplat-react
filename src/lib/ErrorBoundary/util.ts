/**
 * Shallowly compare two arrays to determine if they are different.
 * Uses `Object.is` to perform comparison on each item.
 */
export function isArrayDiff(a: unknown[] = [], b: unknown[] = []) {
  return (
    a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]))
  );
}
