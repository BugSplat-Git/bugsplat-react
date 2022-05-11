import { BugSplat } from 'bugsplat';
import { setBugSplat } from './store';

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
}

/**
 * Initialize BugSplat instance and set it in the store;
 */
export function init({
  database,
  application,
  version,
  defaults = {},
}: BugSplatInit) {
  const instance = new BugSplat(database, application, version);

  const { appKey, description, email, user } = defaults;

  if (appKey) {
    instance.setDefaultAppKey(appKey);
  }
  if (description) {
    instance.setDefaultDescription(description);
  }
  if (email) {
    instance.setDefaultEmail(email);
  }
  if (user) {
    instance.setDefaultUser(user);
  }

  setBugSplat(instance);
}
