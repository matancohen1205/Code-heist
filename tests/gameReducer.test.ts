import { describe, expect, it } from "vitest";
import { createInitialState, gameReducer } from "../src/core/engine/gameReducer";
import { TRACKS, getLevels } from "../src/core/levels";
import { calculateScore, ROOM_SECONDS } from "../src/core/scoring/calculateScore";
import type { DifficultyFilter, GameState, Track } from "../src/core/types";

/** Starts a run, walks into the first room and returns the room state. */
const inRoom = (track: Track = "javascript", difficulty: DifficultyFilter = "all"): GameState =>
  gameReducer(gameReducer(createInitialState(), { type: "START", track, difficulty }), { type: "ENTER_ROOM" });

/** Solves the current room perfectly. */
const solveCurrent = (state: GameState): GameState => {
  const level = state.levels[state.levelIndex];
  const found = gameReducer(state, { type: "SELECT_LINE", index: level.bugLine });
  return gameReducer(found, { type: "CHOOSE_FIX", fixId: level.correctFixId });
};

describe("gameReducer", () => {
  it("starts in the corridor and enters the room on arrival", () => {
    const started = gameReducer(createInitialState(), { type: "START", track: "javascript", difficulty: "all" });
    expect(started.phase).toBe("playing");
    expect(started.scene).toBe("corridor");
    expect(gameReducer(started, { type: "ENTER_ROOM" }).scene).toBe("room");
  });

  it("does not run the clock while walking in the corridor", () => {
    const started = gameReducer(createInitialState(), { type: "START", track: "javascript", difficulty: "all" });
    expect(gameReducer(started, { type: "TICK" }).timeLeft).toBe(ROOM_SECONDS);
  });

  it("loads the chosen track", () => {
    expect(inRoom("python").levels).toEqual(getLevels("python"));
  });

  it("limits the run to the chosen difficulty", () => {
    const state = inRoom("powershell", "hard");
    expect(state.levels.length).toBeGreaterThan(0);
    expect(state.levels.every((level) => level.difficulty === "hard")).toBe(true);
  });

  it("orders a full journey from easy to hard", () => {
    const order = { easy: 0, medium: 1, hard: 2 };
    const ranks = inRoom("python").levels.map((level) => order[level.difficulty]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("keeps the chosen path when restarting", () => {
    const restarted = gameReducer(inRoom("automation", "easy"), { type: "RESTART" });
    expect(restarted.phase).toBe("intro");
    expect(restarted.track).toBe("automation");
    expect(restarted.difficulty).toBe("easy");
  });

  it("penalises a wrong line and advances on the right one", () => {
    const state = inRoom();
    const wrong = gameReducer(state, { type: "SELECT_LINE", index: 0 });
    expect(wrong.mistakes).toBe(1);
    const right = gameReducer(wrong, { type: "SELECT_LINE", index: state.levels[0].bugLine });
    expect(right.stage).toBe("chooseFix");
  });

  it("scores a clean solve and records the result", () => {
    const state = solveCurrent(inRoom());
    expect(state.stage).toBe("solved");
    expect(state.score).toBe(calculateScore(ROOM_SECONDS, 0, 0));
    expect(state.results).toEqual([{ levelId: state.levels[0].id, solved: true, mistakes: 0, hintsUsed: 0 }]);
  });

  it("fails the room when time runs out", () => {
    let state = inRoom();
    for (let i = 0; i < ROOM_SECONDS; i++) state = gameReducer(state, { type: "TICK" });
    expect(state.stage).toBe("failed");
    expect(state.results[0].solved).toBe(false);
  });

  it("walks the corridor again before each next room", () => {
    const next = gameReducer(solveCurrent(inRoom()), { type: "NEXT" });
    expect(next.scene).toBe("corridor");
    expect(next.levelIndex).toBe(1);
  });

  it("finishes after the last room of every track", () => {
    for (const { id } of TRACKS) {
      let state = inRoom(id);
      for (let i = 0; i < state.levels.length; i++) {
        state = gameReducer(solveCurrent(state), { type: "NEXT" });
        if (state.phase === "playing") state = gameReducer(state, { type: "ENTER_ROOM" });
      }
      expect(state.phase).toBe("finished");
      expect(state.solvedCount).toBe(state.levels.length);
    }
  });
});

describe("calculateScore", () => {
  it("never drops below the minimum", () => {
    expect(calculateScore(0, 5, 10)).toBe(10);
  });
});
