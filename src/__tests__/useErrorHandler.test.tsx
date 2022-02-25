import { fireEvent, render } from '@testing-library/react';
import { useEffect, useState } from 'react';
import useErrorHandler from '../useErrorHandler';
import ErrorBoundary, { FallbackProps } from '../ErrorBoundary';

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}

describe('useErrorHandler hook used in child of ErrorBoundary', () => {
  it('should propagate async errors called with imperative handler', async () => {
    function AsyncComponent() {
      const [explode, setExplode] = useState(false);
      const handleError = useErrorHandler();

      useEffect(() => {
        if (explode) {
          const timeout = setTimeout(() => {
            handleError(new Error('Async Error'));
          });

          return () => clearTimeout(timeout);
        }
      });

      return (
        <div role="main">
          <button onClick={() => setExplode(true)}>explode</button>
        </div>
      );
    }

    const { getByRole, findByRole } = render(
      <ErrorBoundary fallback={Fallback}>
        <AsyncComponent />
      </ErrorBoundary>
    );

    fireEvent.click(getByRole('button', { name: /explode/i }));
    await findByRole('alert');

    fireEvent.click(getByRole('button', { name: /try again/i }));
    await findByRole('main');
  });

  it('should propagate error passed declaratively as prop', async () => {
    function AsyncComponent() {
      const [explode, setExplode] = useState(false);
      const [error, setError] = useState<Error | null>(null);

      useErrorHandler(error);

      useEffect(() => {
        if (explode) {
          const timeout = setTimeout(() => {
            setError(new Error('Async Error'));
          });

          return () => clearTimeout(timeout);
        }
      });

      return (
        <div role="main">
          <button onClick={() => setExplode(true)}>explode</button>
        </div>
      );
    }

    const { getByRole, findByRole } = render(
      <ErrorBoundary fallback={Fallback}>
        <AsyncComponent />
      </ErrorBoundary>
    );

    fireEvent.click(getByRole('button', { name: /explode/i }));
    await findByRole('alert');

    fireEvent.click(getByRole('button', { name: /try again/i }));
    await findByRole('main');
  });
});
