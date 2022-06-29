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
  /**
   * Container for BugSplat client instance
   */
  scope?: Scope;
}

/**
 * Container for managing shared `BugSplat` instance
 */
const appScope: Scope = new Scope();

/**
 * Initialize a new BugSplat instance and store the reference in scope
 *
 * @returns function with a callback argument that will be
 * called with the freshly initialized BugSplat instance
 *
 * - Useful to subscribe to events or set default properties
 *
 * @example
 * init({
 *   database: 'fred',
 *   application: 'my-react-crasher',
 *   version: '3.2.1',
 * })((bugSplat) => {
 *   bugSplat.setDefaultAppKey('Key!');
 *   bugSplat.setDefaultUser('User!');
 *   bugSplat.setDefaultEmail('fred@bedrock.com');
 *   bugSplat.setDefaultDescription('Description!');
 * })
 */
export function init({
  database,
  application,
  version,
  scope = appScope,
}: BugSplatInit) {
  const client = new BugSplat(database, application, version);

  scope.setClient(client);

  return (func: (client: BugSplat) => void) => func(client);
}

/**
 * @returns BugSplat client instance or null if unset
 */
export const getBugSplat = (scope = appScope) => scope.getClient();
