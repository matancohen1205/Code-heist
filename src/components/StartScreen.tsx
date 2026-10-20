import { TRACKS, getLevels } from "../core/levels";
import type { Track } from "../core/types";
import { Button } from "./common/Button";

interface StartScreenProps {
  bestScore: number;
  onStart: (track: Track) => void;
}

/** Welcome screen: rules in three steps and a language track picker. */
export function StartScreen({ bestScore, onStart }: StartScreenProps) {
  return (
    <section className="panel panel--center screen-enter">
      <h1 className="title">Code Heist</h1>
      <p className="lead">Sneak through the building room by room. Every door hides a bug to find and fix before the alarm sounds.</p>
      <ol className="steps">
        <li>Click the buggy line of code.</li>
        <li>Choose the correct fix.</li>
        <li>Learn the concept behind each bug.</li>
      </ol>
      {bestScore > 0 && <p className="muted">Best score: {bestScore}</p>}
      <h2 className="fixes__title">Choose your track</h2>
      <div className="actions actions--center">
        {TRACKS.map((track, index) => (
          <Button key={track.id} onClick={() => onStart(track.id)} autoFocus={index === 0}>
            {track.label} ({getLevels(track.id).length} rooms)
          </Button>
        ))}
      </div>
    </section>
  );
}
