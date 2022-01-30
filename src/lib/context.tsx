import { BugSplat } from "bugsplat";
import { ComponentType, createContext, useContext } from "react";
import { ReactNode } from "react";

export const BugSplatContext = createContext<BugSplat | null>(null);
BugSplatContext.displayName = "BugSplatContext";

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
export function useBugSplat(): BugSplat {
  const bugSplatContext = useContext(BugSplatContext);

  if (!bugSplatContext) {
    throw new Error("Must call useBugSplat from a child of BugSplatProvider.");
  }

  return bugSplatContext;
}

/**
 * Higher order component to inject BugSplat instance
 * into component props from context.
 */
export function withBugSplat<P extends { bugSplat?: BugSplat }>(
  Component: ComponentType<P>
): ComponentType<P> {
  const WithBugSplat: ComponentType<P> = (props) => {
    const bugSplat = useBugSplat();

    return <Component bugSplat={bugSplat} {...props} />;
  };
  const componentDisplayName =
    Component.displayName || Component.name || "Component";
  WithBugSplat.displayName = `WithBugSplat(${componentDisplayName})`;

  return WithBugSplat;
}
