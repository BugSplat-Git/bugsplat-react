import { BugSplat } from 'bugsplat';

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
   * Version of application
   */
  version: string;
  /**
   * Callback that is called with `BugSplat`
   * instance after it has been instantiated.
   *
   * Useful to subscribe to events or set default properties
   *
   * @example
   * onInit: (bugSplat: BugSplat) => {
   *   bugSplat.setDefaultAppKey('!Key')
   *   bugSplat.setDefaultDescription('vivid description')
   * }
   */
  onInit?: (instance: BugSplat) => void;
}

/**
 * Collection of methods for initializing
 * and managing a shared `BugSplat` instance
 */
export interface BugSplatScope {
  /**
   * Get scoped `BugSplat` instance
   * or `null` if one isn't set.
   */
  getInstance: () => BugSplat | null;
  /**
   * Initialize `BugSplat` instance and store it internally;
   */
  init: (initOptions: BugSplatInit) => void;
  /**
   * Post an error or string to BugSplat using scoped `BugSplat` instance
   * @see {@link BugSplat.post}
   */
  post: BugSplat['post'];
  /**
   * Remove reference to scoped `BugSplat` instance
   */
  reset: () => void;
}

/**
 * Create a scope for managing a shared `BugSplat` instance
 * @param BugSplatClient - BugSplat js client constructor
 */
export function createScope(BugSplatClient = BugSplat): BugSplatScope {
  let bugSplat: BugSplat | null = null;

  return {
    getInstance: () => bugSplat,

    init: ({ database, application, version, onInit }: BugSplatInit) => {
      bugSplat = new BugSplatClient(database, application, version);

      onInit?.(bugSplat);
    },

    post: (...args) => {
      if (!bugSplat) {
        throw new Error(
          'BugSplat instance not found. Did you forget to init()?'
        );
      }

      return bugSplat.post(...args);
    },

    reset: () => {
      bugSplat = null;
    },
  };
}
