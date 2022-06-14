import { BugSplat } from 'bugsplat';
import { createScope, Scope } from './scope';

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
  /**
   * Container for BugSplat client instance
   */
  scope?: Scope<BugSplat>;
}

/**
 * Container for managing shared `BugSplat` instance
 */
const BugSplatScope = createScope<BugSplat>();

export function init({
  database,
  application,
  version,
  scope = BugSplatScope,
}: BugSplatInit) {
  const bugSplat = new BugSplat(database, application, version);

  scope.setInstance(bugSplat);
}

export const getBugSplat = BugSplatScope.getInstance;

export default BugSplatScope;
