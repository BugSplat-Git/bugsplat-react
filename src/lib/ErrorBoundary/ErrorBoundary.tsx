import { Component, ElementType, ErrorInfo } from "react";
import { BugSplatLogger, Logger } from "../bugsplat-logger";
import BasicFallback from "./BasicFallback";
import { isArrayChanged } from "./util";

const DEFAULT_LOGGER = new BugSplatLogger();
const INITIAL_STATE: ErrorBoundaryState = { error: null };

export interface FallbackProps {
  error?: Error;
  resetErrorBoundary?: (...args: unknown[]) => void;
}

export interface ErrorBoundaryProps {
  /**
   * Callback called when ErrorBoundary catches an error in componentDidCatch()
   */
  onError?: (error: Error, info: ErrorInfo) => void;
  /**
   * Callback called on componentDidMount()
   */
  onMount?: () => void;
  /**
   * Callback called on componentWillUnmount()
   */
  onUnmount?: () => void;
  /**
   * Callback called before ErrorBoundary resets internal state,
   * resulting in rendering children again. This should be
   * used to ensure that rerendering of children would not
   * repeat the same error that occurred.
   *
   * *Not called when reset from change in resetKeys.
   * Use onResetKeysChange for that.*
   */
  onReset?: (...args: unknown[]) => void;
  /**
   * Callback called when keys passed to resetKeys are changed
   */
  onResetKeysChange?: (
    prevResetKeys?: unknown[],
    resetKeys?: unknown[]
  ) => void;
  /**
   * Array of values passed from parent scope. When ErrorBoundary
   * is in an error state, it will check each passed value
   * and automatically reset if any of the values have changed.
   */
  resetKeys?: unknown[];
  /**
   * Fallback component to render when ErrorBoundary catches an error.
   */
  Fallback?: ElementType<FallbackProps>;
  /**
   * Pass a custom logger object
   */
  logger?: Logger;
  /**
   * Hook to change request before it is sent to bugsplat
   */
  beforeCapture?: () => void;
}

export interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  static defaultProps = {
    logger: DEFAULT_LOGGER,
  };

  state = INITIAL_STATE;

  resetErrorBoundary = (...args: unknown[]) => {
    this.props.onReset?.(...args);
    this.reset();
  };

  reset() {
    this.setState(INITIAL_STATE);
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(
    prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState
  ) {
    const { error } = this.state;
    const { resetKeys } = this.props;

    if (
      error !== null &&
      prevState.error !== null &&
      isArrayChanged(prevProps.resetKeys, resetKeys)
    ) {
      this.props.onResetKeysChange?.(prevProps.resetKeys, resetKeys);
      this.reset();
    }
  }

  componentDidMount() {
    this.props.onMount?.();
  }

  componentWillUnmount() {
    this.props.onUnmount?.();
  }

  render() {
    const { error } = this.state;
    const { Fallback = BasicFallback } = this.props;

    if (error !== null) {
      return (
        <Fallback error={error} resetErrorBoundary={this.resetErrorBoundary} />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
