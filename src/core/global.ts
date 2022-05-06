import { type BugSplat } from 'bugsplat';

type Logger = Pick<Console, 'log' | 'info' | 'debug' | 'warn' | 'error'>;

interface BugSplatStore {
  instance?: BugSplat;
  logger: Logger;
}

const defaultBugSplatStore: BugSplatStore = {
  logger: console,
};

/**
 * Represents a partial of globalThis that we care about
 */
export type Root = { __BUGSPLAT__?: BugSplatStore };

const fallbackGlobalThis = {};

/**
 * Get `globalThis` with a fallback
 */
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

/**
 * Replace global BugSplat store with `value`
 */
export function setBugSplatStore(value: BugSplatStore, root = getGlobalRoot()) {
  root.__BUGSPLAT__ = value;
}
