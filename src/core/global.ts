import { type BugSplat } from 'bugsplat';

type Logger = Pick<Console, 'log' | 'info' | 'debug' | 'warn' | 'error'>;

interface BugSplatStore {
  instance?: BugSplat;
  logger: Logger;
}

const defaultBugSplatStore: BugSplatStore = {
  logger: console,
};

export type Root = { __BUGSPLAT__?: BugSplatStore };

const fallbackGlobalThis = {};

function getGlobalRoot(): Root {
  return (globalThis ?? fallbackGlobalThis) as Root;
}

/**
 * Get global BugSplat store object.
 */
export function getBugSplatStore(root = getGlobalRoot()): BugSplatStore {
  if (!root.__BUGSPLAT__) {
    root.__BUGSPLAT__ = { ...defaultBugSplatStore };
  }
  return { ...root.__BUGSPLAT__ };
}

/**
 * Set global BugSplat store by shallow
 * merging `value` with current store
 */
export function updateBugSplatStore(
  value: Partial<BugSplatStore>,
  root = getGlobalRoot()
) {
  root.__BUGSPLAT__ = {
    ...defaultBugSplatStore,
    ...root.__BUGSPLAT__,
    ...value,
  };
}
