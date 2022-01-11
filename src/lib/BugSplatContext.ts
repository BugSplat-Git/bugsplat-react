import { BugSplat } from "bugsplat";
import { createContext } from "react";

export interface BugSplatContextValue {
  bugsplat: BugSplat | null;
}

const BugSplatContext = createContext<BugSplat | null>(null);
BugSplatContext.displayName = "BugSplatContext";

export default BugSplatContext;
