import { withErrorBoundary } from '../src';

describe('withErrorBoundary', () => {
  it('sets displayName properly', () => {
    const InnerComponent = () => <div>hello world</div>;
    const Component = withErrorBoundary(InnerComponent);

    expect(Component.displayName).toBe('ErrorBoundary(InnerComponent)');
  });

  it('sets a generic displayName if function does not have a name', () => {
    const Component = withErrorBoundary(() => <div>hello world</div>);
    expect(Component.displayName).toBe('ErrorBoundary(Component)');
  });
});
