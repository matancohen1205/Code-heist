import { useEffect, useState } from "react";
import { CHOOSE_PATH_LINE, WELCOME_LINES } from "../core/story/dialogue";
import type { DifficultyFilter, Track } from "../core/types";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useTypewriter } from "../hooks/useTypewriter";
import { Button } from "./common/Button";
import { PathPicker } from "./PathPicker";
import { LobbyScene } from "./scene/LobbyScene";
import { Player } from "./scene/Player";
import { SpeechBubble } from "./scene/SpeechBubble";

const WALK_IN_MS = 1400; // how long Sam takes to walk into the lobby

interface IntroScreenProps {
  skipDialogue: boolean; // true when the player has already seen the intro
  onStart: (track: Track, difficulty: DifficultyFilter) => void;
}

/** Welcome scene: Sam walks in, introduces the game in speech bubbles, then offers the path picker. */
export function IntroScreen({ skipDialogue, onStart }: IntroScreenProps) {
  const reduced = usePrefersReducedMotion();
  const [arrived, setArrived] = useState(skipDialogue || reduced);
  const [step, setStep] = useState(0);
  const [choosing, setChoosing] = useState(skipDialogue);

  // Sam walks in before the first line of dialogue.
  useEffect(() => {
    if (arrived) return;
    const timer = window.setTimeout(() => setArrived(true), WALK_IN_MS);
    return () => window.clearTimeout(timer);
  }, [arrived]);

  const line = choosing ? CHOOSE_PATH_LINE : WELCOME_LINES[step];
  const { shown, done, finish } = useTypewriter(line, arrived && !choosing && !reduced);
  const isLastLine = step === WELCOME_LINES.length - 1;

  // First press completes the typing, the next press moves on.
  const handleNext = () => {
    if (!done) finish();
    else if (isLastLine) setChoosing(true);
    else setStep(step + 1);
  };

  const skip = () => {
    setArrived(true);
    setChoosing(true);
  };

  return (
    <section className="intro screen-enter">
      <h1 className="title">Code Heist</h1>
      <p className="lead">Find the bug in every room. Learn the concept. Beat the clock.</p>

      <LobbyScene>
        <div className={`lobby__actor ${arrived ? "" : "lobby__actor--entering"}`}>
          <Player walking={!arrived} talking={arrived && !choosing && !done} />
        </div>
        {arrived && (
          <SpeechBubble className="lobby__bubble">
            <span aria-hidden="true">{choosing ? line : shown}</span>
            <span className="visually-hidden" role="status">{line}</span>
          </SpeechBubble>
        )}
      </LobbyScene>

      {choosing ? (
        <PathPicker onStart={onStart} />
      ) : (
        <div className="actions actions--center">
          <Button onClick={handleNext} autoFocus={arrived}>
            {done && isLastLine ? "Choose a path" : "Next"}
          </Button>
          <Button variant="ghost" onClick={skip}>Skip intro</Button>
        </div>
      )}
    </section>
  );
}
