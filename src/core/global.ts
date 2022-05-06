import { type BugSplat } from 'bugsplat';

type Logger = Pick<Console, 'log' | 'info' | 'debug' | 'warn' | 'error'>;

interface BugSplatStore {
  instance?: BugSplat;
  logger: Logger;
}

const defaultBugSplatStore: BugSplatStore = {
  logger: console,
};

declare global {
  // eslint-disable-next-line no-var
  var __BUGSPLAT__: BugSplatStore | undefined;
}

type Root = { __BUGSPLAT__?: BugSplatStore };

const fallbackGlobalThis = {};

function getGlobalRoot(): Root {
  return globalThis ?? fallbackGlobalThis;
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
 * Set global BugSplat store.
 *
 * **This will replace an existing value.**
 */
export function updateBugSplatStore(
  value: Partial<BugSplatStore>,
  root = getGlobalRoot()
) {
  root.__BUGSPLAT__ = Object.assign(
    {},
    defaultBugSplatStore,
    root.__BUGSPLAT__,
    value
  );
}
