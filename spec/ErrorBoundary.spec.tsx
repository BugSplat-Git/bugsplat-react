import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BugSplat, BugSplatOptions, BugSplatResponse } from 'bugsplat';
import { useState } from 'react';
import { ErrorBoundary } from '../src/ErrorBoundary';
import { Scope } from '../src/scope';

export const mockPost = jest.fn(
  async (_errorToPost: string | Error, _options?: BugSplatOptions) =>
    new Promise<BugSplatResponse>((resolve) => resolve({} as BugSplatResponse))
);

const MockBugSplat = jest.fn(function (
  this: BugSplat,
  ..._args: ConstructorParameters<typeof BugSplat>
) {
  this.post = mockPost;

  return this;
});

const BlowUpError = new Error('Error thrown during render.');

function BlowUp(): JSX.Element {
  throw BlowUpError;
}

beforeEach(() => {
  mockPost.mockClear();
});

describe('<ErrorBoundary />', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child Div</div>
      </ErrorBoundary>
    );
    const childDiv = screen.queryByText('Child Div');
    expect(childDiv).toBeInTheDocument();
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
    it('should not call BugSplat callbacks if no instance is present', () => {
      const mockBeforePost = jest.fn();
      render(
        <ErrorBoundary beforePost={mockBeforePost}>
          <BlowUp />
        </ErrorBoundary>
      );

      expect(mockPost).toHaveBeenCalledTimes(0);
      expect(mockBeforePost).toHaveBeenCalledTimes(0);
    });

    describe('when BugSplat has been initialized', () => {
      let bugSplat: BugSplat;
      let scope: Pick<Scope, 'getClient'>;

      beforeEach(() => {
        bugSplat = new MockBugSplat('db1', 'this app', '3.2.1');
        scope = { getClient: () => bugSplat };
      });

      it('should call onError', async () => {
        const mockOnError = jest.fn();
        render(
          <ErrorBoundary onError={mockOnError} scope={scope}>
            <BlowUp />
          </ErrorBoundary>
        );

        await waitFor(() => expect(mockOnError).toHaveBeenCalledTimes(1));
      });

      it('should not post if disablePost is set to true', () => {
        const mockBeforePost = jest.fn();
        render(
          <ErrorBoundary disablePost beforePost={mockBeforePost} scope={scope}>
            <BlowUp />
          </ErrorBoundary>
        );

        expect(mockPost).toHaveBeenCalledTimes(0);
        expect(mockBeforePost).toHaveBeenCalledTimes(0);
      });

      it('should call BugSplat.post', async () => {
        render(
          <ErrorBoundary scope={scope}>
            <BlowUp />
          </ErrorBoundary>
        );

        await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
      });

      it('should call beforePost', async () => {
        const mockBeforePost = jest.fn();
        render(
          <ErrorBoundary beforePost={mockBeforePost} scope={scope}>
            <BlowUp />
          </ErrorBoundary>
        );

        await waitFor(() => expect(mockBeforePost).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
      });
    });

    it('should render a basic fallback element', () => {
      render(
        <ErrorBoundary fallback={<p>This is fallback</p>}>
          <div>Child Div</div>
          <BlowUp />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Child Div')).not.toBeInTheDocument();
      expect(screen.queryByText('This is fallback')).toBeInTheDocument();
    });

    it('should render a fallback render prop', () => {
      render(
        <ErrorBoundary fallback={() => <p>This is fallback</p>}>
          <div>Child Div</div>
          <BlowUp />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Child Div')).not.toBeInTheDocument();
      expect(screen.queryByText('This is fallback')).toBeInTheDocument();
    });

    it('should call onReset with extra args passed from resetErrorBoundary', () => {
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

      fireEvent.click(screen.getByText('Try Again'));
      expect(mockOnReset.mock.lastCall).toContain(TRY_AGAIN_ARGS[0]);
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
