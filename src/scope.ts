/**
 * Container for shared instance management
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
}

/**
 * Scope factory function
 */
export function createScope<Type>(
  defaultValue: Type | null = null
): Scope<Type> {
  let instance = defaultValue;

  return {
    setInstance(value) {
      instance = value;
    },

    getInstance() {
      return instance;
    },
  };
}
