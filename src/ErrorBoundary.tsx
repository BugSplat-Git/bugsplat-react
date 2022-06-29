import { BugSplat, BugSplatResponse, FormDataParam } from 'bugsplat';
import {
  Component,
  ErrorInfo,
  FunctionComponent,
  isValidElement,
  ReactElement,
  ReactNode,
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
function packComponentStack(componentStack: string): FormDataParam {
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

export type FallbackElement = ReactElement<
  unknown,
  string | FunctionComponent | typeof Component
> | null;

export type FallbackRender = (props: FallbackProps) => FallbackElement;

interface InternalErrorBoundaryProps {
  /**
   * Callback called before error post to BugSplat.
   */
  beforePost: (
    bugSplat: BugSplat,
    error: Error | null,
    componentStack: string | null
  ) => void;

  /**
   * Callback called when ErrorBoundary catches an error in componentDidCatch()
   */
  onError: (
    error: Error,
    componentStack: string,
    response: BugSplatResponse | null
  ) => void;

  /**
   * Callback called on componentDidMount().
   */
  onMount: () => void;

  /**
   * Callback called on componentWillUnmount().
   */
  onUnmount: (
    error: Error | null,
    componentStack: string | null,
    response: BugSplatResponse | null
  ) => void;

  /**
   * Callback called before ErrorBoundary resets internal state,
   * resulting in rendering children again. This should be
   * used to ensure that rerendering of children would not
   * repeat the same error that occurred.
   *
   * *Not called when reset from change in resetKeys -
   * use onResetKeysChange for that.*
   */
  onReset: (
    error: Error | null,
    componentStack: string | null,
    response: BugSplatResponse | null,
    extraArgs?: unknown[]
  ) => void;

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
   * BugSplat client instance
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.handleError(error, errorInfo).catch(console.error);
  }

  componentWillUnmount() {
    const { error, componentStack, response } = this.state;
    this.props.onUnmount(error, componentStack, response);
  }

  async handleError(error: Error, { componentStack }: ErrorInfo) {
    const { onError, beforePost, disablePost, scope } = this.props;

    let response: BugSplatResponse | null = null;

    const client = scope.getClient();

    if (client && !disablePost) {
      beforePost(client, error, componentStack);
      try {
        response = await client.post(error, {
          additionalFormDataParams: [packComponentStack(componentStack)],
        });
      } catch (err) {
        console.error(err);
      }
    }

    onError(error, componentStack, response);
    this.setState({ error, componentStack, response });
  }

  resetErrorBoundary = (...args: unknown[]) => {
    const { error, componentStack, response } = this.state;
    this.props.onReset(error, componentStack, response, args);
    this.reset();
  };

  reset() {
    this.setState(INITIAL_STATE);
  }

  render() {
    const { error, componentStack, response } = this.state;
    const { fallback, children } = this.props;

    if (error) {
      if (isValidElement(fallback)) {
        return fallback;
      } else if (typeof fallback === 'function') {
        return fallback({
          error,
          componentStack,
          response,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      } else {
        return null;
      }
    }

    return children;
  }
}

export default ErrorBoundary;
