import { Component, ElementType, ErrorInfo } from "react";
import { BugSplatLogger, Logger } from "../bugsplat-logger";
import BasicFallback from "./BasicFallback";
import { isArrayChanged } from "./util";

const DEFAULT_LOGGER = new BugSplatLogger();

export interface ErrorBoundaryFallbackProps {
  error?: Error;
  resetErrorBoundary?: (...args: unknown[]) => void;
}

export interface ErrorBoundaryProps {
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: (...args: unknown[]) => void;
  onResetKeysChange?: (
    prevResetKeys?: unknown[],
    resetKeys?: unknown[]
  ) => void;
  resetKeys?: unknown[];
  Fallback?: ElementType<ErrorBoundaryFallbackProps>;
  logger?: Logger;
}

export interface ErrorBoundaryState {
  error: Error | null;
}

const initialState: ErrorBoundaryState = { error: null };

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  static defaultProps = {
    logger: DEFAULT_LOGGER,
    Fallback: BasicFallback,
  };

  state = initialState;

  resetErrorBoundary = (...args: unknown[]) => {
    this.props.onReset?.(...args);
    this.reset();
  };

  reset() {
    this.setState(initialState);
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

  /**
   * Hook to change request before it is sent to bugsplat
   */
  beforeCapture() {
    throw new Error("Not Implemented");
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
