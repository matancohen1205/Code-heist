/** A candidate replacement for the buggy line. */
export interface FixOption {
  id: string;
  text: string;
}

/** One vault room: a code snippet with exactly one buggy line. */
export interface Level {
  id: string;
  title: string;
  story: string;
  lines: string[];
  bugLine: number; // zero-based index into `lines`
  fixes: FixOption[];
  correctFixId: string;
  hint: string;
  explanation: string;
}

/** Where the player is inside a single room. */
export type Stage = "findBug" | "chooseFix" | "solved" | "failed";

/** Top-level screen of the game. */
export type Phase = "intro" | "playing" | "finished";

export interface GameState {
  phase: Phase;
  levels: Level[];
  levelIndex: number;
  stage: Stage;
  timeLeft: number;
  score: number;
  mistakes: number; // mistakes in the current room
  hintsUsed: number; // hints used in the current room
  hintVisible: boolean;
  message: string; // short feedback for the live region
  solvedCount: number;
}

export type GameAction =
  | { type: "START" }
  | { type: "SELECT_LINE"; index: number }
  | { type: "CHOOSE_FIX"; fixId: string }
  | { type: "USE_HINT" }
  | { type: "TICK" }
  | { type: "NEXT" }
  | { type: "RESTART" };
