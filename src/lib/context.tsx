import { BugSplat } from "bugsplat";
import { createContext, useContext } from "react";
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
