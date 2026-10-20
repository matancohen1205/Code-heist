import { describe, expect, it } from "vitest";
import { createInitialState, gameReducer } from "../src/core/engine/gameReducer";
import { calculateScore, ROOM_SECONDS } from "../src/core/scoring/calculateScore";
import type { GameState } from "../src/core/types";

/** Starts a run and returns the playing state. */
const started = (): GameState => gameReducer(createInitialState(), { type: "START" });

describe("gameReducer", () => {
  it("starts in the first room with a full clock", () => {
    const state = started();
    expect(state.phase).toBe("playing");
    expect(state.timeLeft).toBe(ROOM_SECONDS);
  });

  it("penalises a wrong line and advances on the right one", () => {
    const state = started();
    const wrong = gameReducer(state, { type: "SELECT_LINE", index: 0 });
    expect(wrong.mistakes).toBe(1);
    const right = gameReducer(wrong, { type: "SELECT_LINE", index: state.levels[0].bugLine });
    expect(right.stage).toBe("chooseFix");
  });

  it("scores a clean solve", () => {
    let state = started();
    const level = state.levels[0];
    state = gameReducer(state, { type: "SELECT_LINE", index: level.bugLine });
    state = gameReducer(state, { type: "CHOOSE_FIX", fixId: level.correctFixId });
    expect(state.stage).toBe("solved");
    expect(state.score).toBe(calculateScore(ROOM_SECONDS, 0, 0));
  });

  it("fails the room when time runs out", () => {
    let state = started();
    for (let i = 0; i < ROOM_SECONDS; i++) state = gameReducer(state, { type: "TICK" });
    expect(state.stage).toBe("failed");
  });

  it("finishes after the last room", () => {
    let state = started();
    for (let i = 0; i < state.levels.length; i++) {
      const level = state.levels[state.levelIndex];
      state = gameReducer(state, { type: "SELECT_LINE", index: level.bugLine });
      state = gameReducer(state, { type: "CHOOSE_FIX", fixId: level.correctFixId });
      state = gameReducer(state, { type: "NEXT" });
    }
    expect(state.phase).toBe("finished");
    expect(state.solvedCount).toBe(state.levels.length);
  });
});

describe("calculateScore", () => {
  it("never drops below the minimum", () => {
    expect(calculateScore(0, 5, 10)).toBe(10);
  });
});
