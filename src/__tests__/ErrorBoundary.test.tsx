import { fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { BugSplat } from 'bugsplat';
import { BugSplatProvider } from '../bugsplat-context';

const mockPost = jest.fn(async () => ({}));
jest.mock('bugsplat', () => ({
  BugSplat: jest.fn().mockImplementation(() => ({
    post: mockPost,
  })),
}));

const BlowUpError = new Error('Error thrown during render.');

function BlowUp(): JSX.Element {
  throw BlowUpError;
}

beforeEach(() => {
  mockPost.mockClear();
});

describe('<ErrorBoundary />', () => {
  it('should render children when there is no error', () => {
    const { queryByText } = render(
      <ErrorBoundary>
        <div>Child Div</div>
      </ErrorBoundary>
    );
    const childDiv = queryByText('Child Div');
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
    it('should call onError', () => {
      const mockOnError = jest.fn();
      render(
        <ErrorBoundary onError={mockOnError}>
          <BlowUp />
        </ErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalledTimes(1);
    });

    describe('when BugSplat instance passed as prop', () => {
      const bugSplat = new BugSplat('test-db', 'test', '1.33.7');
      it('should call BugSplat.post', () => {
        render(
          <ErrorBoundary bugSplat={bugSplat}>
            <BlowUp />
          </ErrorBoundary>
        );

        expect(mockPost).toHaveBeenCalledTimes(1);
      });

      it('should call beforePost', () => {
        const mockBeforePost = jest.fn();
        render(
          <ErrorBoundary bugSplat={bugSplat} beforePost={mockBeforePost}>
            <BlowUp />
          </ErrorBoundary>
        );

        expect(mockPost).toHaveBeenCalledTimes(1);
        expect(mockBeforePost).toHaveBeenCalledTimes(1);
      });

      it('should not post if skipPost is set to true', () => {
        const mockBeforePost = jest.fn();
        render(
          <ErrorBoundary
            skipPost
            bugSplat={bugSplat}
            beforePost={mockBeforePost}
          >
            <BlowUp />
          </ErrorBoundary>
        );

        expect(mockPost).toHaveBeenCalledTimes(0);
        expect(mockBeforePost).toHaveBeenCalledTimes(0);
      });
    });

    describe('when child of BugSplatProvider', () => {
      const bugSplat = new BugSplat('test-db', 'test', '1.33.7');
      it('should call BugSplat.post', () => {
        render(
          <BugSplatProvider value={bugSplat}>
            <ErrorBoundary>
              <BlowUp />
            </ErrorBoundary>
          </BugSplatProvider>
        );

        expect(mockPost).toHaveBeenCalledTimes(1);
      });

      it('should call beforePost', () => {
        const mockBeforePost = jest.fn();
        render(
          <BugSplatProvider value={bugSplat}>
            <ErrorBoundary beforePost={mockBeforePost}>
              <BlowUp />
            </ErrorBoundary>
          </BugSplatProvider>
        );

        expect(mockPost).toHaveBeenCalledTimes(1);
        expect(mockBeforePost).toHaveBeenCalledTimes(1);
      });

      it('should not post if skipPost is set to true', () => {
        const mockBeforePost = jest.fn();
        render(
          <BugSplatProvider value={bugSplat}>
            <ErrorBoundary skipPost beforePost={mockBeforePost}>
              <BlowUp />
            </ErrorBoundary>
          </BugSplatProvider>
        );

        expect(mockPost).toHaveBeenCalledTimes(0);
        expect(mockBeforePost).toHaveBeenCalledTimes(0);
      });
    });

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

    it('should render a basic fallback element', () => {
      const { queryByText } = render(
        <ErrorBoundary fallback={<p>This is fallback</p>}>
          <div>Child Div</div>
          <BlowUp />
        </ErrorBoundary>
      );

      expect(queryByText('Child Div')).not.toBeInTheDocument();
      expect(queryByText('This is fallback')).toBeInTheDocument();
    });

    it('should render a fallback render prop', () => {
      const { queryByText } = render(
        <ErrorBoundary fallback={() => <p>This is fallback</p>}>
          <div>Child Div</div>
          <BlowUp />
        </ErrorBoundary>
      );

      expect(queryByText('Child Div')).not.toBeInTheDocument();
      expect(queryByText('This is fallback')).toBeInTheDocument();
    });

    it('supports automatic reset when resetKeys change', () => {
      const handleResetKeysChange = jest.fn();
      const handleReset = jest.fn<void, unknown[]>();
      const TRY_AGAIN_ARGS = ['TRY_AGAIN_ARG1', 'TRY_AGAIN_ARG2'];

      function App() {
        const [explode, setExplode] = useState(false);
        const [key, setKey] = useState(false);
        return (
          <div>
            <button onClick={() => setExplode((e) => !e)}>
              toggle explode
            </button>
            <ErrorBoundary
              fallback={({ resetErrorBoundary }) => (
                <div role="alert">
                  <button
                    onClick={() => resetErrorBoundary?.(...TRY_AGAIN_ARGS)}
                  >
                    Try Again
                  </button>
                  <button onClick={() => setKey((k) => !k)}>
                    toggle extra reset key
                  </button>
                </div>
              )}
              resetKeys={key ? [explode, key] : [explode]}
              onReset={(...args) => {
                setExplode(false);
                handleReset(...args);
              }}
              onResetKeysChange={handleResetKeysChange}
            >
              {explode || key ? <BlowUp /> : null}
            </ErrorBoundary>
          </div>
        );
      }

      // blow it up
      const { getByText, getByRole, queryByRole } = render(<App />);
      fireEvent.click(getByText('toggle explode'));
      expect(getByRole('alert')).toBeInTheDocument();

      // recover via try again button
      fireEvent.click(getByText('Try Again'));
      expect(queryByRole('alert')).not.toBeInTheDocument();
      const extraArgsCall = handleReset.mock.calls[0][3];
      expect(extraArgsCall).toEqual(['TRY_AGAIN_ARG1', 'TRY_AGAIN_ARG2']);
      expect(handleReset).toHaveBeenCalledTimes(1);
      handleReset.mockClear();
      expect(handleResetKeysChange).not.toHaveBeenCalled();

      // blow up again
      fireEvent.click(getByText('toggle explode'));
      expect(getByRole('alert')).toBeInTheDocument();

      // recover via resetKeys change
      fireEvent.click(getByText('toggle explode'));
      expect(handleResetKeysChange).toHaveBeenCalledWith([true], [false]);
      expect(handleResetKeysChange).toHaveBeenCalledTimes(1);
      handleResetKeysChange.mockClear();
      expect(handleReset).not.toHaveBeenCalled();
      expect(queryByRole('alert')).not.toBeInTheDocument();

      // blow it up again
      fireEvent.click(getByText('toggle explode'));
      expect(getByRole('alert')).toBeInTheDocument();

      // toggles adding reset key to Array
      // expect error to re-render
      fireEvent.click(getByText('toggle extra reset key'));
      expect(handleReset).not.toHaveBeenCalled();
      expect(handleResetKeysChange).toHaveBeenCalledTimes(1);
      expect(handleResetKeysChange).toHaveBeenCalledWith([true], [true, true]);
      handleResetKeysChange.mockClear();
      expect(getByRole('alert')).toBeInTheDocument();

      // toggle explode back to false
      // expect error to re-render again
      fireEvent.click(getByText('toggle explode'));
      expect(handleReset).not.toHaveBeenCalled();
      expect(handleResetKeysChange).toHaveBeenCalledTimes(1);
      expect(handleResetKeysChange).toHaveBeenCalledWith(
        [true, true],
        [false, true]
      );
      handleResetKeysChange.mockClear();
      expect(getByRole('alert')).toBeInTheDocument();

      // toggle extra reset key
      // expect error to be reset
      fireEvent.click(getByText('toggle extra reset key'));
      expect(handleReset).not.toHaveBeenCalled();
      expect(handleResetKeysChange).toHaveBeenCalledTimes(1);
      expect(handleResetKeysChange).toHaveBeenCalledWith(
        [false, true],
        [false]
      );
      handleResetKeysChange.mockClear();
      expect(queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});