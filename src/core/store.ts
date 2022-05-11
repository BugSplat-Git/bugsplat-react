import { type BugSplat } from 'bugsplat';

interface BugSplatStore {
  instance?: BugSplat;
}

const globalStore: BugSplatStore = Object.seal({
  instance: undefined,
});

/**
 * Get BugSplat instance from store.
 */
export function getBugSplat(store = globalStore) {
  return store.instance;
}

/**
 * Set BugSplat instance in store.
 */
export function setBugSplat(instance?: BugSplat, store = globalStore) {
  store.instance = instance;
}
