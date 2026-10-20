import { useEffect, useRef, useState } from "react";
import { DIFFICULTIES, TRACKS } from "../core/levels";
import type { DifficultyFilter, Track } from "../core/types";
import { Button } from "./common/Button";

interface PathPickerProps {
  onStart: (track: Track, difficulty: DifficultyFilter) => void;
}

/** Two-step picker: a topic first, then a single tier or the full easy-to-hard journey. */
export function PathPicker({ onStart }: PathPickerProps) {
  const [track, setTrack] = useState<Track | null>(null);
  const tierHeading = useRef<HTMLHeadingElement>(null);

  // Move focus to the difficulty step once a topic is chosen.
  useEffect(() => {
    if (track) tierHeading.current?.focus();
  }, [track]);

  return (
    <section className="path" aria-labelledby="topic-heading">
      <h2 id="topic-heading" className="path__heading">Choose your topic</h2>
      <div className="path__topics" role="group" aria-labelledby="topic-heading">
        {TRACKS.map((info) => (
          <button
            key={info.id}
            type="button"
            className={`topic ${track === info.id ? "topic--selected" : ""}`}
            data-track={info.id}
            aria-pressed={track === info.id}
            onClick={() => setTrack(info.id)}
          >
            <span className="topic__icon" aria-hidden="true">{info.icon}</span>
            <span className="topic__name">{info.label}</span>
            <span className="topic__blurb">{info.blurb}</span>
          </button>
        ))}
      </div>

      {track && (
        <div className="path__tiers screen-enter">
          <h2 className="path__heading" ref={tierHeading} tabIndex={-1}>Choose your difficulty</h2>
          <div className="actions actions--center">
            <Button onClick={() => onStart(track, "all")}>Full journey: easy to hard</Button>
            {DIFFICULTIES.map((tier) => (
              <Button key={tier} variant="ghost" onClick={() => onStart(track, tier)}>
                {tier[0].toUpperCase() + tier.slice(1)} only
              </Button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
