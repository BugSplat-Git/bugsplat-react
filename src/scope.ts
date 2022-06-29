import { BugSplat } from 'bugsplat';

/**
 * Encapsulate BugSplat client instance
 */
export class Scope {
  constructor(private client: BugSplat | null = null) {}

  /**
   * @returns BugSplat client instance or null if unset
   */
  getClient() {
    return this.client;
  }

  setClient(client: BugSplat | null) {
    this.client = client;
  }

  /**
   * Call fn with the client if it has been initialized.
   * Otherwise, do nothing
   */
  withClient<R = unknown>(fn: (bugSplat: BugSplat) => R) {
    if (this.client) {
      return fn(this.client);
    }
  }
}

const bugSplatScope = new Scope();

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

export function init({
  database,
  application,
  version,
  scope = bugSplatScope,
}: BugSplatInit) {
  const client = new BugSplat(database, application, version);

  scope.setClient(client);
}
