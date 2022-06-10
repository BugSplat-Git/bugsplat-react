export class Scope<Type, Options> {
  private instance: Type | null = null;
  private initialize: (options: Options) => Type;

  /**
   * @param initialize - Function to initialize a fresh instance
   */
  constructor(initialize: (options: Options) => Type) {
    this.initialize = initialize;
  }

  /**
   * Initialize instance and store it internally;
   */
  init(options: Options) {
    this.instance = this.initialize(options);

    return this;
  }

  /**
   * @returns scoped instance or `null` if one isn't set.
   */
  getInstance() {
    return this.instance;
  }

  /**
   * Remove reference to scoped instance
   */
  clearInstance() {
    this.instance = null;
  }

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
  useInstance(action: (instance: Type | null) => void) {
    action(this.instance);

    return this;
  }
}
