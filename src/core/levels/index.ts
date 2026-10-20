import type { Difficulty, DifficultyFilter, Level, Track } from "../types";
import { AUTOMATION_LEVELS } from "./automation";
import { JAVASCRIPT_LEVELS } from "./javascript";
import { POWERSHELL_LEVELS } from "./powershell";
import { PYTHON_LEVELS } from "./python";

/** Display data for a topic on the path picker. */
export interface TrackInfo {
  id: Track;
  label: string;
  blurb: string;
  icon: string; // short code shown on posters and cards
  fileExt: string; // default extension for generated file names
}

export const TRACKS: TrackInfo[] = [
  { id: "javascript", label: "JavaScript", blurb: "Closures, async, equality", icon: "JS", fileExt: "js" },
  { id: "python", label: "Python", blurb: "Loops, types, dictionaries", icon: "PY", fileExt: "py" },
  { id: "powershell", label: "PowerShell", blurb: "Pipeline, scope, errors", icon: "PS", fileExt: "ps1" },
  { id: "automation", label: "Automation", blurb: "Bash, cron and CI", icon: "SH", fileExt: "sh" },
];

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const LEVELS_BY_TRACK: Record<Track, Level[]> = {
  javascript: JAVASCRIPT_LEVELS,
  python: PYTHON_LEVELS,
  powershell: POWERSHELL_LEVELS,
  automation: AUTOMATION_LEVELS,
};

/** Rooms for a track, ordered from easy to hard, optionally limited to one tier. */
export function getLevels(track: Track, difficulty: DifficultyFilter = "all"): Level[] {
  const all = LEVELS_BY_TRACK[track];
  const picked = difficulty === "all" ? all : all.filter((level) => level.difficulty === difficulty);
  return [...picked].sort((a, b) => DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty));
}

/** How many rooms each tier has in a track. */
export function countByDifficulty(track: Track): Record<Difficulty, number> {
  const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  for (const level of LEVELS_BY_TRACK[track]) counts[level.difficulty] += 1;
  return counts;
}

/** Looks up display data for a track. */
export function getTrackInfo(track: Track): TrackInfo {
  return TRACKS.find((info) => info.id === track) ?? TRACKS[0];
}

/** File name shown on the monitor title bar. */
export function fileNameFor(level: Level, track: Track): string {
  if (level.file) return level.file;
  return `${level.id.replace(/^(py|ps|au)-/, "")}.${getTrackInfo(track).fileExt}`;
}
