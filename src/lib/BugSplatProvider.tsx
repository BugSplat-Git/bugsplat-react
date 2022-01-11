import { BugSplat } from "bugsplat";
import { ReactNode } from "react";
import BugSplatContext from "./BugSplatContext";

export interface BugSplatProviderProps {
  /**
   * BugSplat instance provided to children.
   *
   * *Should be memoized if created in a component*
   */
  bugsplat: BugSplat;
  children: ReactNode;
}

export default function BugSplatProvider(props: BugSplatProviderProps) {
  const { children, bugsplat } = props;

  return (
    <BugSplatContext.Provider value={bugsplat}>
      {children}
    </BugSplatContext.Provider>
  );
}
