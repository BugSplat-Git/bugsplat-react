import { BugSplat } from 'bugsplat';
import { getBugSplatStore, updateBugSplatStore } from './global';

export interface BugSplatInit {
  /**
   * BugSplat database name that crashes are posted to
   */
  database: string;
  /**
   * Name of application
   */
  application: string;
  /**
   * Version of application
   */
  version: string;
  /**
   * Sets default properties to be sent with crashes
   */
  defaults?: {
    appKey?: string;
    description?: string;
    email?: string;
    user?: string;
  };
  /**
   * Specify a root object to attach the instance to.
   */
  root?: Record<string, unknown>;
}

/**
 * Initialize BugSplat instance and attach it to a root object;
 */
export function init({
  database,
  application,
  version,
  defaults = {},
  root,
}: BugSplatInit) {
  const instance = new BugSplat(database, application, version);

  if (defaults.appKey) {
    instance.setDefaultAppKey(defaults.appKey);
  }
  if (defaults.description) {
    instance.setDefaultDescription(defaults.description);
  }
  if (defaults.email) {
    instance.setDefaultEmail(defaults.email);
  }
  if (defaults.user) {
    instance.setDefaultUser(defaults.user);
  }

  updateBugSplatStore({ instance }, root);
}

/**
 * @returns global BugSplat instance
 */
export function getBugSplat() {
  const { instance } = getBugSplatStore();

  // if (!instance) {
  //   throw new Error(
  //     'BugSplat instance not found. Did you forget to initialize?'
  //   );
  // }

  return instance;
}
