import { useEffect, useMemo, useReducer } from "react";
import { createInitialState, gameReducer } from "../core/engine/gameReducer";
import type { GameState } from "../core/types";

/** Connects the pure game reducer to React and drives the room timer. */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const timerRunning =
    state.phase === "playing" && (state.stage === "findBug" || state.stage === "chooseFix");

  // One-second tick, active only while a room is being played.
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const actions = useMemo(
    () => ({
      start: () => dispatch({ type: "START" }),
      selectLine: (index: number) => dispatch({ type: "SELECT_LINE", index }),
      chooseFix: (fixId: string) => dispatch({ type: "CHOOSE_FIX", fixId }),
      useHint: () => dispatch({ type: "USE_HINT" }),
      next: () => dispatch({ type: "NEXT" }),
      restart: () => dispatch({ type: "RESTART" }),
    }),
    [],
  );

  return { state: state as GameState, actions };
}
