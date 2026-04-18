import type { BugSplat, BugSplatAttachment } from 'bugsplat';

/**
 * Build a `BugSplatAttachment` from a React component stack string.
 *
 * Runtimes disagree on what FormData can serialize, so the exact shape used
 * for the attachment is a runtime concern, not a `bugsplat-react` concern.
 * This is the seam `ErrorBoundary` delegates to before posting; override it on
 * the scope to emit something other than the web-friendly default (for
 * example, React Native can't serialize browser `Blob`s in FormData and needs
 * a `{ uri, type }` file-ref instead).
 */
export type CreateComponentStackAttachment = (
  componentStack: string
) => BugSplatAttachment;

/**
 * Default builder — wraps the stack in a `text/plain` `Blob`, which is what
 * browser FormData needs to emit a multipart file part.
 */
export const defaultCreateComponentStackAttachment: CreateComponentStackAttachment = (
  componentStack
) => ({
  filename: 'componentStack.txt',
  data: new Blob([componentStack], { type: 'text/plain' }),
});

/**
 * Dependency container read by `ErrorBoundary` at post time.
 *
 * Holds the active `BugSplat` client plus any platform-varying behavior
 * ErrorBoundary needs to delegate (currently: how to turn a component stack
 * into an attachment). Runtimes like `@bugsplat/expo` replace the default
 * attachment builder with their own in `init()`.
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

  getCreateComponentStackAttachment() {
    return this.createComponentStackAttachment;
  }

  setCreateComponentStackAttachment(fn: CreateComponentStackAttachment) {
    this.createComponentStackAttachment = fn;
  }
}
