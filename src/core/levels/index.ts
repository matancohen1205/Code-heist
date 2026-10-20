import type { Level, Track } from "../types";
import { JAVASCRIPT_LEVELS } from "./javascript";
import { PYTHON_LEVELS } from "./python";

/** Tracks shown on the start screen. */
export const TRACKS: { id: Track; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
];

const LEVELS_BY_TRACK: Record<Track, Level[]> = {
  javascript: JAVASCRIPT_LEVELS,
  python: PYTHON_LEVELS,
};

/** Returns the ordered rooms for a track. */
export function getLevels(track: Track): Level[] {
  return LEVELS_BY_TRACK[track];
}
