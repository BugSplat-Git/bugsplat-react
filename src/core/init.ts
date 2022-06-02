import { BugSplat } from 'bugsplat';
import { setBugSplat } from './global-store';

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
   * Sets default property values to be sent with crashes
   */
  defaultProps?: {
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
  defaultProps = {},
}: BugSplatInit) {
  const instance = new BugSplat(database, application, version);

  setBugSplat(instance);

  setDefaultProps(instance, defaultProps);
}

function setDefaultProps(
  instance: BugSplat,
  defaultProps: BugSplatInit['defaultProps'] = {}
) {
  const { appKey, description, email, user } = defaultProps;

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
}
