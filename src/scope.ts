import type { BugSplat, BugSplatAttachment } from 'bugsplat';

/**
 * Builds the componentStack attachment for ErrorBoundary posts.
 */
export type CreateComponentStackAttachment = (
  componentStack: string
) => BugSplatAttachment;

/**
 * Default builder — wraps the stack in a `text/plain` `Blob`.
 */
export const defaultCreateComponentStackAttachment: CreateComponentStackAttachment = (
  componentStack
) => ({
  filename: 'componentStack.txt',
  data: new Blob([componentStack], { type: 'text/plain' }),
});

/**
 * Encapsulate BugSplat client instance and scope-level overrides.
 */
export class Scope {
  constructor(
    private client: BugSplat | null = null,
    private createComponentStackAttachment: CreateComponentStackAttachment = defaultCreateComponentStackAttachment
  ) {}

  /**
   * @returns BugSplat client instance or null if unset
   */
  getClient() {
    return this.client;
  }

  setClient(client: BugSplat) {
    this.client = client;
  }

  /**
   * @returns the current componentStack attachment builder
   */
  getCreateComponentStackAttachment() {
    return this.createComponentStackAttachment;
  }

  setCreateComponentStackAttachment(fn: CreateComponentStackAttachment) {
    this.createComponentStackAttachment = fn;
  }
}
