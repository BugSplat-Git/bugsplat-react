import {
  type BugSplat,
  type BugSplatResponse,
  type FormDataParam,
} from 'bugsplat';
import {
  Component,
  type ErrorInfo,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { getBugSplat } from './appScope';

/**
 * Shallowly compare two arrays to determine if they are different.
 *
 * Uses `Object.is` to perform comparison on each item.
 *
 * @returns true if arrays are the same length and shallowly equal
 */
function isArrayDiff(a: unknown[] = [], b: unknown[] = []) {
  if (a.length !== b.length) {
    return true;
  }

  return a.some((item, index) => !Object.is(item, b[index]));
}

/**
 * Pack a component stack trace string into an expected object shape
 */
function createComponentStackFormDataParam(
  componentStack: string
): FormDataParam {
  return {
    key: 'componentStack',
    value: new Blob([componentStack]),
    filename: 'componentStack.txt',
  };
}

export interface FallbackProps {
  error: Error;
  componentStack: string | null;
  response: BugSplatResponse | null;
  resetErrorBoundary: (...args: unknown[]) => void;
}

export type FallbackElement = ReactElement | null;

export type FallbackRender = (props: FallbackProps) => FallbackElement;

interface InternalErrorBoundaryProps {
  /**
   * Callback called before error post to BugSplat.
   *
   * This will be awaited if it is a promise
   */
  beforePost: (
    bugSplat: BugSplat,
    error: Error | null,
    componentStack: string | null
  ) => void | Promise<void>;

  /**
   * Callback called when ErrorBoundary catches an error in componentDidCatch()
   *
   * This will be awaited if it is a promise
   */
  onError: (
    error: Error,
    componentStack: string,
    response: BugSplatResponse | null
  ) => void | Promise<void>;

  /**
   * Callback called on componentDidMount().
   */
  onMount: () => void;

  /**
   * Callback called on componentWillUnmount().
   */
  onUnmount: (state: ErrorBoundaryState) => void;

  /**
   * Callback called before ErrorBoundary resets internal state,
   * resulting in rendering children again. This should be
   * used to ensure that rerendering of children would not
   * repeat the same error that occurred.
   *
   * *This method is not called when ErrorBoundary is reset from a
   * change in resetKeys - use onResetKeysChange for that.*
   * @param state - Current error boundary state
   * @param ...args - Additional arguments passed from where it is called
   */
  onReset: (state: ErrorBoundaryState, ...args: unknown[]) => void;

  /**
   * Callback called when keys passed to resetKeys are changed.
   */
  onResetKeysChange: (prevResetKeys?: unknown[], resetKeys?: unknown[]) => void;

  /**
   * Array of values passed from parent scope. When ErrorBoundary
   * is in an error state, it will check each passed value
   * and automatically reset if any of the values have changed.
   */
  resetKeys?: unknown[];

  /**
   * Provide a fallback to render when ErrorBoundary catches an error.
   * Not required, but it is highly recommended to provide a value for this.
   *
   * This can be an element or a function that renders an element.
   */
  fallback?: FallbackElement | FallbackRender;

  /**
   * If true, caught errors will not be automatically posted to BugSplat.
   */
  disablePost?: boolean;

  /**
   * Child elements to be rendered when there is no error
   */
  children?: ReactNode | ReactNode[];

  /**
   * __Advanced Use__
   *
   * Object used by ErrorBoundary to retrieve a BugSplat client instance.
   *
   * Advanced users can extend the `BugSplat` class and use this property
   * to pass their own scope that will inject the client for use by
   * ErrorBoundary.
   */
  scope: { getClient(): BugSplat | null };
}

export type ErrorBoundaryProps = JSX.LibraryManagedAttributes<
  typeof ErrorBoundary,
  InternalErrorBoundaryProps
>;

export interface ErrorBoundaryState {
  /**
   * Rendering error; if one occurred.
   */
  error: Error | null;
  /**
   * Component stack trace of a rendering error; if one occurred.
   */
  componentStack: ErrorInfo['componentStack'] | null;
  /**
   * Response from most recent BugSplat crash post
   */
  response: BugSplatResponse | null;
}

const INITIAL_STATE: ErrorBoundaryState = {
  error: null,
  componentStack: null,
  response: null,
};

/**
 * Empty function that does nothing
 *
 * Useful as a placeholder
 */
function noop(..._args: unknown[]) {
  // this comment allows empty function
}

/**
 * Handle errors that occur during rendering by wrapping
 * your component tree with ErrorBoundary. Any number of ErrorBoundary
 * components can be rendered in the tree and any rendering error will
 * propagate to the nearest one.
 */
export class ErrorBoundary extends Component<
  InternalErrorBoundaryProps,
  ErrorBoundaryState
> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  static defaultProps: InternalErrorBoundaryProps = {
    beforePost: noop,
    onError: noop,
    onMount: noop,
    onReset: noop,
    onResetKeysChange: noop,
    onUnmount: noop,
    disablePost: false,
    scope: { getClient: getBugSplat },
  };

  state = INITIAL_STATE;

  componentDidMount() {
    this.props.onMount();
  }

  componentDidUpdate(
    prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState
  ) {
    const { error } = this.state;
    const { resetKeys, onResetKeysChange } = this.props;

    if (
      error !== null &&
      prevState.error !== null &&
      isArrayDiff(prevProps.resetKeys, resetKeys)
    ) {
      onResetKeysChange(prevProps.resetKeys, resetKeys);
      this.reset();
    }
  }

  componentDidCatch(error: Error, { componentStack }: ErrorInfo) {
    this.setState({ error, componentStack });
    this.handleError(error, componentStack).catch(console.error);
  }

  componentWillUnmount() {
    this.props.onUnmount({ ...this.state });
  }

  async dispatchPost(error: Error, componentStack: string) {
    const { beforePost, disablePost, scope } = this.props;
    const client = scope.getClient();

    if (!client || disablePost) {
      return null;
    }

    await beforePost(client, error, componentStack);

    return client.post(error, {
      additionalFormDataParams: [
        createComponentStackFormDataParam(componentStack),
      ],
    });
  }

  async handleError(error: Error, componentStack: string) {
    const response = await this.dispatchPost(error, componentStack);

    this.setState({ response });

    return this.props.onError(error, componentStack, response);
  }

  resetErrorBoundary = (...args: unknown[]) => {
    this.props.onReset({ ...this.state }, ...args);
    this.reset();
  };

  reset() {
    this.setState(INITIAL_STATE);
  }

  render() {
    const {
      state: { error, componentStack, response },
      props: { fallback, children },
      resetErrorBoundary,
    } = this;

    if (!error) {
      return children;
    }

    if (isValidElement(fallback)) {
      return fallback;
    }

    if (typeof fallback === 'function') {
      return fallback({
        error,
        componentStack,
        response,
        resetErrorBoundary,
      });
    }

    return null;
  }
}
