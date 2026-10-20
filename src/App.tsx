import { useEffect, useState } from "react";
import { CorridorScreen } from "./components/CorridorScreen";
import { ResultScreen } from "./components/ResultScreen";
import { RoomScreen } from "./components/RoomScreen";
import { IntroScreen } from "./components/IntroScreen";
import { useGame } from "./hooks/useGame";
import { loadBestScore, saveBestScore } from "./services/storage";

/** Picks the screen for the current game phase and scene. */
export default function App() {
  const { state, actions } = useGame();
  const [bestScore, setBestScore] = useState(loadBestScore);
  const [introSeen, setIntroSeen] = useState(false);

  // Persist the best score once a run ends.
  useEffect(() => {
    if (state.phase === "finished") setBestScore(saveBestScore(state.score));
  }, [state.phase, state.score]);

  return (
    <main className="app">
      {state.phase === "intro" && (
        <IntroScreen
          skipDialogue={introSeen}
          onStart={(track, difficulty) => {
            setIntroSeen(true);
            actions.start(track, difficulty);
          }}
        />
      )}
      {state.phase === "playing" && state.scene === "corridor" && (
        <CorridorScreen track={state.track} levels={state.levels} roomIndex={state.levelIndex} onArrive={actions.enterRoom} />
      )}
      {state.phase === "playing" && state.scene === "room" && (
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
          track={state.track}
          difficulty={state.difficulty}
          score={state.score}
          bestScore={bestScore}
          levels={state.levels}
          results={state.results}
          onRestart={actions.restart}
        />
      )}
    </main>
  );
}
