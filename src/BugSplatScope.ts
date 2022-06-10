import { BugSplat } from 'bugsplat';
import { Scope } from './scope';

export interface BugSplatInit {
  /**
   * BugSplat database name that crashes should be posted to
   */
  database: string;
  /**
   * Name of application
   */
  application: string;
  /**
   * Version of application.
   */
  version: string;
}

export function createBugSplatScope() {
  return new Scope(({ database, application, version }: BugSplatInit) => {
    return new BugSplat(database, application, version);
  });
}

/**
 * Default scope for managing shared `BugSplat` instance
 */
const BugSplatScope = createBugSplatScope();

export const init = BugSplatScope.init.bind(BugSplatScope);
export const useInstance = BugSplatScope.useInstance.bind(BugSplatScope);
export const getInstance = BugSplatScope.getInstance.bind(BugSplatScope);
export const clearInstance = BugSplatScope.clearInstance.bind(BugSplatScope);

export default BugSplatScope;
