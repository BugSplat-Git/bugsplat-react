import { jest } from '@jest/globals';
import {
  BugSplat,
  type BugSplatOptions,
  type BugSplatResponse,
} from 'bugsplat';
import { useState } from 'react';
import { ErrorBoundary } from '../src/ErrorBoundary';
import { Scope } from '../src/scope';
import { fireEvent, render, screen, waitFor } from './testUtils';

const mockPost = jest.fn(
  async (_errorToPost: string | Error, _options?: BugSplatOptions) =>
    new Promise<BugSplatResponse>((resolve) => resolve({} as BugSplatResponse))
);

function BlowUp(): JSX.Element {
  throw new Error('Error thrown during render.');
}

function BasicFallback() {
  return <div role="alert">Error!</div>;
}

beforeEach(() => {
  mockPost.mockReset();
});

describe('<ErrorBoundary />', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child Div</div>
      </ErrorBoundary>
    );
    screen.getByText('Child Div');
  });

  it('calls onMount when mounted', () => {
    const mockOnMount = jest.fn();

    render(
      <ErrorBoundary onMount={mockOnMount}>
        <div>Child Div</div>
      </ErrorBoundary>
    );

    expect(mockOnMount).toHaveBeenCalledTimes(1);
  });

  it('calls onUnmount when unmounted', () => {
    const mockOnUnmount = jest.fn();

    const { unmount } = render(
      <ErrorBoundary onUnmount={mockOnUnmount}>
        <div>Child Div</div>
      </ErrorBoundary>
    );

    expect(mockOnUnmount).toHaveBeenCalledTimes(0);
    unmount();
    expect(mockOnUnmount).toHaveBeenCalledTimes(1);
  });

  describe('when a rendering error has occurred', () => {
    const mockBeforePost = jest.fn(
      (_b: BugSplat, _e: Error | null, _c: string | null) => {
        /**
         * EMPTY *
         */
      }
    );

    beforeEach(() => {
      mockBeforePost.mockReset();
    });

    it('should not call BugSplat callbacks if no instance is present', async () => {
      render(
        <ErrorBoundary beforePost={mockBeforePost} fallback={BasicFallback}>
          <BlowUp />
        </ErrorBoundary>
      );

      await screen.findByRole('alert');

      expect(mockPost).toHaveBeenCalledTimes(0);
      expect(mockBeforePost).toHaveBeenCalledTimes(0);
    });

    describe('when BugSplat has been initialized', () => {
      let bugSplat: BugSplat;
      let scope: Pick<Scope, 'getClient'>;

      beforeEach(() => {
        bugSplat = {
          database: '',
          application: '',
          version: '',
          post: mockPost,
        } as unknown as BugSplat;
        scope = { getClient: () => bugSplat };
      });

      it('should call onError', async () => {
        const mockOnError = jest.fn(
          (_e: Error, _c: string, _r: BugSplatResponse | null) => {
            /**
             * EMPTY *
             */
          }
        );
        render(
          <ErrorBoundary
            onError={mockOnError}
            scope={scope}
            fallback={BasicFallback}
          >
            <BlowUp />
          </ErrorBoundary>
        );

        await screen.findByRole('alert');

        expect(mockOnError).toHaveBeenCalledTimes(1);
      });

      it('should not post if disablePost is set to true', async () => {
        render(
          <ErrorBoundary
            disablePost
            beforePost={mockBeforePost}
            scope={scope}
            fallback={BasicFallback}
          >
            <BlowUp />
          </ErrorBoundary>
        );

        await screen.findByRole('alert');

        expect(mockPost).toHaveBeenCalledTimes(0);
        expect(mockBeforePost).toHaveBeenCalledTimes(0);
      });

      it('should call BugSplat.post', async () => {
        render(
          <ErrorBoundary scope={scope} fallback={BasicFallback}>
            <BlowUp />
          </ErrorBoundary>
        );

        await screen.findByRole('alert');

        await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
      });

      it('should call beforePost', async () => {
        render(
          <ErrorBoundary
            beforePost={mockBeforePost}
            scope={scope}
            fallback={BasicFallback}
          >
            <BlowUp />
          </ErrorBoundary>
        );

        await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));

        expect(mockBeforePost).toHaveBeenCalledTimes(1);
      });
    });

    it('should render a basic fallback element', async () => {
      render(
        <ErrorBoundary fallback={<p role="alert">This is fallback</p>}>
          <div>Child Div</div>
          <BlowUp />
        </ErrorBoundary>
      );

      await screen.findByText('This is fallback');
      expect(screen.queryByText('Child Div')).not.toBeInTheDocument();
    });

    it('should render a fallback render prop', async () => {
      render(
        <ErrorBoundary fallback={() => <p role="alert">This is fallback</p>}>
          <div>Child Div</div>
          <BlowUp />
        </ErrorBoundary>
      );

      await screen.findByText('This is fallback');
      expect(screen.queryByText('Child Div')).not.toBeInTheDocument();
    });

    it('should call onReset with extra args passed from resetErrorBoundary', async () => {
      const TRY_AGAIN_ARGS = ['TRY_AGAIN_ARG1', 'TRY_AGAIN_ARG2'];
      const mockOnReset = jest.fn();

      render(
        <ErrorBoundary
          onReset={mockOnReset}
          fallback={({ resetErrorBoundary }) => (
            <button onClick={() => resetErrorBoundary(...TRY_AGAIN_ARGS)}>
              Try Again
            </button>
          )}
        >
          <BlowUp />
        </ErrorBoundary>
      );

      await screen.findByText(/try again/i);

      fireEvent.click(screen.getByText(/try again/i));

      await waitFor(() =>
        expect(mockOnReset.mock.lastCall).toContain(TRY_AGAIN_ARGS[0])
      );
      expect(mockOnReset.mock.lastCall).toContain(TRY_AGAIN_ARGS[1]);
    });

    it('should reset when any value in resetKeys changes', async () => {
      const handleResetKeysChange = jest.fn();
      const handleReset = jest.fn();
      function App() {
        const [key, setKey] = useState(0);
        return (
          <ErrorBoundary
            fallback={<button onClick={() => setKey(0)}>reset</button>}
            resetKeys={[key]}
            onReset={handleReset}
            onResetKeysChange={handleResetKeysChange}
          >
            <main>
              <button onClick={() => setKey((k) => k + 1)}>explode</button>
              {key && <BlowUp />}
            </main>
          </ErrorBoundary>
        );
      }

      render(<App />);

      fireEvent.click(screen.getByText('explode'));
      await waitFor(() => screen.getByText('reset'));

      fireEvent.click(screen.getByText('reset'));
      await waitFor(() => screen.getByRole('main'));

      expect(screen.queryByText('reset')).not.toBeInTheDocument();

      expect(handleReset).not.toHaveBeenCalled();
      expect(handleResetKeysChange).toHaveBeenCalledWith([1], [0]);
    });
  });
});
