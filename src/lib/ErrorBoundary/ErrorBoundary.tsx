import {
  Component,
  ComponentType,
  ErrorInfo,
  FunctionComponent,
  isValidElement,
  ReactElement,
} from "react";
import { BugSplatLogger, Logger } from "../bugsplat-logger";
import { isArrayChanged } from "./util";

const DEFAULT_LOGGER = new BugSplatLogger();
const INITIAL_STATE: ErrorBoundaryState = { error: null };

export interface FallbackProps {
  error?: Error;
  resetErrorBoundary?: (...args: unknown[]) => void;
}

export type FallbackElement = ReactElement<
  unknown,
  string | FunctionComponent | typeof Component
> | null;
export type FallbackComponent = ComponentType<FallbackProps>;
export type FallbackRender = (props: FallbackProps) => FallbackElement;

/**
 * Provide a fallback to render when ErrorBoundary catches an error.
 *
 * This can be a component, a function that renders an element
 * or a rendered element from the parent scope.
 */
export type FallbackVariantProps =
  | {
      fallback: FallbackElement;
      FallbackComponent?: never;
      renderFallback?: never;
    }
  | {
      fallback?: never;
      FallbackComponent: FallbackComponent;
      renderFallback?: never;
    }
  | {
      fallback?: never;
      FallbackComponent?: never;
      renderFallback: FallbackRender;
    };

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
  onUnmount?: (error: Error | null) => void;
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
   * Pass a custom logger object
   */
  logger?: Logger;
  /**
   * Callback called before captured error is sent to BugSplat
   */
  beforeCapture?: (error: Error | null, info: ErrorInfo | null) => void;
}

export interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps & FallbackVariantProps,
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
    this.props.onUnmount?.(this.state.error);
  }

  render() {
    const { error } = this.state;
    const { fallback, renderFallback, FallbackComponent } = this.props;

    if (error !== null) {
      const fallbackProps = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      };
      if (isValidElement(fallback)) {
        return fallback;
      } else if (typeof renderFallback === "function") {
        return renderFallback(fallbackProps);
      } else if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />;
      } else {
        throw new Error(
          "ErrorBoundary requires either a fallback, renderFallback, or FallbackComponent prop."
        );
      }
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
