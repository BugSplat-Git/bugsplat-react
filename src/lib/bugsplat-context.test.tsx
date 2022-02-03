import { withBugSplat } from './bugsplat-context';

describe('withBugSplat', () => {
  it('sets displayName properly', () => {
    const InnerComponent = () => <div>hello world</div>;
    const Component = withBugSplat(InnerComponent);

    expect(Component.displayName).toBe('BugSplat(InnerComponent)');
  });

  it('sets a generic displayName if function does not have a name', () => {
    const Component = withBugSplat(() => <div>hello world</div>);
    expect(Component.displayName).toBe('BugSplat(Component)');
  });
});
