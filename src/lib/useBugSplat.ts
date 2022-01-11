import { useContext } from "react";
import BugSplatContext from "./BugSplatContext";
import { BugSplat } from "bugsplat";

/**
 * Retrieve the BugSplat instance provided by a parent BugSplatProvider
 * @returns {BugSplat} BugSplat instance
 */
export default function useBugSplat(): BugSplat {
  const bugSplatContext = useContext(BugSplatContext);

  if (!bugSplatContext) {
    throw new Error("Must call useBugSplat from a child of BugSplatProvider");
  }

  return bugSplatContext;
}
