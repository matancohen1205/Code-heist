import type { Level } from "../types";

/** True when the chosen line index is the buggy one. */
export function isBugLine(level: Level, index: number): boolean {
  return level.bugLine === index;
}

/** True when the chosen fix is the correct replacement. */
export function isCorrectFix(level: Level, fixId: string): boolean {
  return level.correctFixId === fixId;
}
