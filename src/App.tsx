import { useEffect, useState } from "react";
import { ResultScreen } from "./components/ResultScreen";
import { RoomScreen } from "./components/RoomScreen";
import { StartScreen } from "./components/StartScreen";
import { useGame } from "./hooks/useGame";
import { loadBestScore, saveBestScore } from "./services/storage";

/** Picks the screen for the current game phase. */
export default function App() {
  const { state, actions } = useGame();
  const [bestScore, setBestScore] = useState(loadBestScore);

  // Persist the best score once a run ends.
  useEffect(() => {
    if (state.phase === "finished") setBestScore(saveBestScore(state.score));
  }, [state.phase, state.score]);

  return (
    <main className="app">
      {state.phase === "intro" && (
        <StartScreen bestScore={bestScore} roomCount={state.levels.length} onStart={actions.start} />
      )}
      {state.phase === "playing" && (
        <RoomScreen
          state={state}
          onSelectLine={actions.selectLine}
          onChooseFix={actions.chooseFix}
          onHint={actions.useHint}
          onNext={actions.next}
        />
      )}
      {state.phase === "finished" && (
        <ResultScreen
          score={state.score}
          bestScore={bestScore}
          solved={state.solvedCount}
          roomCount={state.levels.length}
          onRestart={actions.restart}
        />
      )}
    </main>
  );
}
