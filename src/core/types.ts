/** Language track a player can practice. */
export type Track = "javascript" | "python" | "powershell" | "automation";

export type Difficulty = "easy" | "medium" | "hard";

/** A single tier, or the whole easy-to-hard journey. */
export type DifficultyFilter = Difficulty | "all";

/** A candidate replacement for the buggy line. */
export interface FixOption {
  id: string;
  text: string;
}

/** One vault room: a code snippet with exactly one buggy line. */
export interface Level {
  id: string;
  title: string;
  topic: string; // the concept this bug teaches
  difficulty: Difficulty;
  file?: string; // file name shown on the monitor; derived from id when omitted
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

/** While playing: walking the corridor or solving the room. */
export type Scene = "corridor" | "room";

/** Outcome of one finished room, used for the study summary. */
export interface RoomResult {
  levelId: string;
  solved: boolean;
  mistakes: number;
  hintsUsed: number;
}

export interface GameState {
  phase: Phase;
  track: Track;
  difficulty: DifficultyFilter;
  scene: Scene;
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
  results: RoomResult[];
}

export type GameAction =
  | { type: "START"; track: Track; difficulty: DifficultyFilter }
  | { type: "ENTER_ROOM" }
  | { type: "SELECT_LINE"; index: number }
  | { type: "CHOOSE_FIX"; fixId: string }
  | { type: "USE_HINT" }
  | { type: "TICK" }
  | { type: "NEXT" }
  | { type: "RESTART" };
