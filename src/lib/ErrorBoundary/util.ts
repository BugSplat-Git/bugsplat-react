/**
 * Determine if an array
 * @param a
 * @param b
 * @returns
 */
export function isArrayChanged(a: unknown[] = [], b: unknown[] = []) {
  return (
    a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]))
  );
}
