/**
 * Create a scope container for managing a shared instance
 */
export function createScope<Type>(): Scope<Type> {
  let instance: Type | null = null;

  return {
    setInstance(value) {
      instance = value;
    },

    getInstance() {
      return instance;
    },

    useInstance(action) {
      action(instance);
    },
  };
}

/**
 * Scope container for shared instance management
 */
export interface Scope<Type> {
  /**
   * @returns scoped instance or `null` if one isn't set.
   */
  getInstance: () => Type | null;
  /**
   * Set scoped instance
   */
  setInstance: (value: Type | null) => void;
  /**
   * Perform an action using the instance
   *
   * Useful to subscribe to events or set default properties
   *
   * @example
   * useInstance((instance: BugSplat) => {
   *   instance.setDefaultAppKey('!Key')
   *   instance.setDefaultDescription('vivid description')
   * })
   */
  useInstance: (action: (instance: Type | null) => void) => void;
}
