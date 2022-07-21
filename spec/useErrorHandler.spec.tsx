import { fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { useErrorHandler, ErrorBoundary, FallbackProps } from '../src';

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

    render(
      <ErrorBoundary fallback={Fallback}>
        <AsyncComponent />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /explode/i }));
    await screen.findByRole('alert');

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    await screen.findByRole('main');
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

    render(
      <ErrorBoundary fallback={Fallback}>
        <AsyncComponent />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /explode/i }));
    await screen.findByRole('alert');

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    await screen.findByRole('main');
  });
});
