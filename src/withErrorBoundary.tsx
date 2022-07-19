import { ComponentType } from 'react';
import { ErrorBoundary, ErrorBoundaryProps } from './ErrorBoundary';

/**
 * Higher order component to wrap your component tree with ErrorBoundary
 */
export function withErrorBoundary<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  errorBoundaryProps: ErrorBoundaryProps = {}
): ComponentType<P> {
  const WrappedComponent: ComponentType<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  const componentDisplayName =
    Component.displayName || Component.name || 'Component';

  WrappedComponent.displayName = `ErrorBoundary(${componentDisplayName})`;

  return WrappedComponent;
}
