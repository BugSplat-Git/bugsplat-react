import { ComponentType } from "react";
import ErrorBoundary, { ErrorBoundaryProps } from "./ErrorBoundary";

/**
 * Higher order component to wrap your component tree with ErrorBoundary
 */
export default function withErrorBoundary<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  errorBoundaryProps: ErrorBoundaryProps
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  const componentDisplayName =
    Component.displayName || Component.name || "Component";

  WrappedComponent.displayName = `ErrorBoundary(${componentDisplayName})`;

  return WrappedComponent;
}
