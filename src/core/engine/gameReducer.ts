import { getLevels } from "../levels";
import { ROOM_SECONDS, calculateScore } from "../scoring/calculateScore";
import type { GameAction, GameState, RoomResult, Track } from "../types";
import { isBugLine, isCorrectFix } from "./checkAnswer";

/** Fresh state shown on the start screen. */
export function createInitialState(track: Track = "javascript"): GameState {
  return {
    phase: "intro",
    track,
    scene: "corridor",
    levels: getLevels(track),
    levelIndex: 0,
    stage: "findBug",
    timeLeft: ROOM_SECONDS,
    score: 0,
    mistakes: 0,
    hintsUsed: 0,
    hintVisible: false,
    message: "",
    solvedCount: 0,
    results: [],
  };
}

/** Walks to a room: resets per-room counters and shows the corridor first. */
function enterCorridor(state: GameState, levelIndex: number): GameState {
  return {
    ...state,
    levelIndex,
    scene: "corridor",
    stage: "findBug",
    timeLeft: ROOM_SECONDS,
    mistakes: 0,
    hintsUsed: 0,
    hintVisible: false,
    message: "",
  };
}

/** Appends the outcome of the current room to the run history. */
function withResult(state: GameState, solved: boolean): RoomResult[] {
  const level = state.levels[state.levelIndex];
  return [
    ...state.results,
    { levelId: level.id, solved, mistakes: state.mistakes, hintsUsed: state.hintsUsed },
  ];
}

/** Registers a wrong guess with a short feedback message. */
function registerMistake(state: GameState, message: string): GameState {
  return { ...state, mistakes: state.mistakes + 1, message };
}

/** Handles a click on a code line. */
function selectLine(state: GameState, index: number): GameState {
  if (state.stage !== "findBug") return state;
  const level = state.levels[state.levelIndex];
  if (isBugLine(level, index)) {
    return { ...state, stage: "chooseFix", message: "Found it! Now pick the correct fix." };
  }
  return registerMistake(state, `Line ${index + 1} looks fine. Try another line.`);
}

/** Handles a click on a fix option. */
function chooseFix(state: GameState, fixId: string): GameState {
  if (state.stage !== "chooseFix") return state;
  const level = state.levels[state.levelIndex];
  if (!isCorrectFix(level, fixId)) {
    return registerMistake(state, "That fix does not work. Try again.");
  }
  const points = calculateScore(state.timeLeft, state.hintsUsed, state.mistakes);
  return {
    ...state,
    stage: "solved",
    score: state.score + points,
    solvedCount: state.solvedCount + 1,
    results: withResult(state, true),
    message: `Room cleared! +${points} points.`,
  };
}

/** Advances the clock; fails the room when time runs out. */
function tick(state: GameState): GameState {
  const running = state.stage === "findBug" || state.stage === "chooseFix";
  if (state.phase !== "playing" || state.scene !== "room" || !running) return state;
  const timeLeft = state.timeLeft - 1;
  if (timeLeft > 0) return { ...state, timeLeft };
  return {
    ...state,
    timeLeft: 0,
    stage: "failed",
    results: withResult(state, false),
    message: "Time is up! The alarm sounds.",
  };
}

/** Moves to the next room, or ends the run after the last one. */
function next(state: GameState): GameState {
  if (state.stage !== "solved" && state.stage !== "failed") return state;
  const nextIndex = state.levelIndex + 1;
  if (nextIndex >= state.levels.length) return { ...state, phase: "finished", message: "" };
  return enterCorridor(state, nextIndex);
}

/** Pure state machine for the whole game. */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START":
      return enterCorridor({ ...createInitialState(action.track), phase: "playing" }, 0);
    case "ENTER_ROOM":
      return state.scene === "corridor" ? { ...state, scene: "room" } : state;
    case "SELECT_LINE":
      return selectLine(state, action.index);
    case "CHOOSE_FIX":
      return chooseFix(state, action.fixId);
    case "USE_HINT":
      if (state.hintVisible) return state;
      return { ...state, hintVisible: true, hintsUsed: state.hintsUsed + 1 };
    case "TICK":
      return tick(state);
    case "NEXT":
      return next(state);
    case "RESTART":
      return createInitialState(state.track);
    default:
      return state;
  }
}
