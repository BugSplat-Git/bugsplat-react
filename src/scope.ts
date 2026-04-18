import type { BugSplat } from 'bugsplat';

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

  setClient(client: BugSplat) {
    this.client = client;
  }
}
