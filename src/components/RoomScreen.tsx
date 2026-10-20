import type { GameState } from "../core/types";
import { Button } from "./common/Button";
import { CodeViewer } from "./CodeViewer";
import { FixOptions } from "./FixOptions";
import { HUD } from "./HUD";

interface RoomScreenProps {
  state: GameState;
  onSelectLine: (index: number) => void;
  onChooseFix: (fixId: string) => void;
  onHint: () => void;
  onNext: () => void;
}

/** One playable room: story, code, fixes, hint and feedback. */
export function RoomScreen({ state, onSelectLine, onChooseFix, onHint, onNext }: RoomScreenProps) {
  const level = state.levels[state.levelIndex];
  const { stage } = state;
  const finished = stage === "solved" || stage === "failed";
  const correctFix = level.fixes.find((fix) => fix.id === level.correctFixId);
  const isLast = state.levelIndex === state.levels.length - 1;

  return (
    <div className="room">
      <HUD room={state.levelIndex + 1} totalRooms={state.levels.length} timeLeft={state.timeLeft} score={state.score} />
      <section className="panel">
        <h1 className="room__title">{level.title}</h1>
        <p className="lead">{level.story}</p>

        <CodeViewer
          lines={level.lines}
          bugLine={level.bugLine}
          interactive={stage === "findBug"}
          revealBug={stage !== "findBug"}
          replacement={finished ? correctFix?.text : undefined}
          onSelect={onSelectLine}
        />

        {stage === "chooseFix" && <FixOptions options={level.fixes} onChoose={onChooseFix} />}

        {/* Live region so screen readers announce feedback. */}
        <p className="feedback" role="status" aria-live="polite">{state.message}</p>

        {state.hintVisible && <p className="hint">Hint: {level.hint}</p>}
        {finished && <p className="explanation">{level.explanation}</p>}

        <div className="actions">
          {!finished && (
            <Button variant="ghost" onClick={onHint} disabled={state.hintVisible}>
              Hint (-25 points)
            </Button>
          )}
          {finished && (
            <Button onClick={onNext} autoFocus>
              {isLast ? "See results" : "Next room"}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
