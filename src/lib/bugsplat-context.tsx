import { BugSplat } from 'bugsplat';
import { ComponentType, createContext, useContext } from 'react';
import { ReactNode } from 'react';

export const BugSplatContext = createContext<BugSplat | null>(null);
BugSplatContext.displayName = 'BugSplatContext';

export interface BugSplatProviderProps {
  /**
   * BugSplat instance
   *
   * *Should be memoized if created in a component*
   */
  bugSplat: BugSplat;
  children: ReactNode;
}

/**
 * Provide BugSplat instance to children.
 * @param props
 * @returns
 */
export function BugSplatProvider(props: BugSplatProviderProps) {
  const { children, bugSplat } = props;

  return (
    <BugSplatContext.Provider value={bugSplat}>
      {children}
    </BugSplatContext.Provider>
  );
}

/**
 * Retrieve the BugSplat instance provided by a parent BugSplatProvider
 * @returns {BugSplat} BugSplat instance
 */
export function useBugSplat(): BugSplat | null {
  return useContext(BugSplatContext);
}

/**
 * Higher order component to inject BugSplat instance
 * into component props from context.
 */
export function withBugSplat<P extends { bugSplat?: BugSplat }>(
  Component: ComponentType<P>,
  bugSplat?: BugSplat
): ComponentType<P> {
  const WithBugSplat: ComponentType<P> = (props) => {
    const bugSplatContext = useBugSplat();

    return <Component bugSplat={bugSplat ?? bugSplatContext} {...props} />;
  };
  const componentDisplayName =
    Component.displayName || Component.name || 'Component';
  WithBugSplat.displayName = `BugSplat(${componentDisplayName})`;

  return WithBugSplat;
}
