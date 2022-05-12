import { useState } from 'react';

/**
 * Utility hook to declaratively or imperatively propagate an
 * error to the nearest error boundary.
 *
 * *Should be called from a child of ErrorBoundary*
 *
 * Propagate error:
 *
 * * Declaratively - by passing an error prop
 * * Imperatively - by calling the returned handler with an error
 *
 * @param errorProp - Will throw when a truthy value is passed
 */
export default function useErrorHandler(
  errorProp?: unknown
): (error: unknown) => void {
  const [error, setError] = useState<unknown>(null);

  if (errorProp) {
    throw errorProp;
  }
  if (error) {
    throw error;
  }

  return setError;
}
