import type { BugSplatOptions } from 'bugsplat';
import { getBugSplat } from './global-store';

const INSTANCE_NOT_FOUND =
  'BugSplat instance not found. Did you forget to init()?';

/**
 * Post an error or string to BugSplat using the global `BugSplat` instance
 * @param errorToPost - Error or message to send to BugSplat
 * @param options - additional options passed to BugSplat
 */
export function postToBugSplat(
  errorToPost: string | Error,
  options?: BugSplatOptions
) {
  const bugSplat = getBugSplat();

  if (!bugSplat) {
    throw new Error(INSTANCE_NOT_FOUND);
  }

  return bugSplat.post(errorToPost, options);
}
