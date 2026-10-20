import { useEffect, useState, type CSSProperties } from "react";
import { FIRST_DOOR_LINE, NEXT_DOOR_LINE } from "../core/story/dialogue";
import type { Level, Track } from "../core/types";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { Button } from "./common/Button";
import { Player } from "./scene/Player";
import { SpeechBubble } from "./scene/SpeechBubble";

const WALK_MS = 1800; // time the player walks to the next door
const OPEN_MS = 700; // time the door takes to open before the room appears
const ENTRANCE_PERCENT = 12; // where the player starts before the first door

interface CorridorScreenProps {
  track: Track;
  levels: Level[];
  roomIndex: number; // the room the player is walking toward
  onArrive: () => void;
}

/** Horizontal position (percent) of the centre of door `index`. */
function doorPercent(index: number, total: number): number {
  return ((index + 0.5) / total) * 100;
}

/** Animated corridor: the guide walks to the next door, which opens onto the room. */
export function CorridorScreen({ track, levels, roomIndex, onArrive }: CorridorScreenProps) {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const level = levels[roomIndex];
  const from = roomIndex === 0 ? ENTRANCE_PERCENT : doorPercent(roomIndex - 1, levels.length);
  const to = doorPercent(roomIndex, levels.length);
  const nearRightEdge = to > 60; // keep the bubble inside the corridor

  // Walk, then open the door, then hand control back to the game.
  useEffect(() => {
    if (reduced) {
      onArrive();
      return;
    }
    const openTimer = window.setTimeout(() => setOpen(true), WALK_MS);
    const arriveTimer = window.setTimeout(onArrive, WALK_MS + OPEN_MS);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(arriveTimer);
    };
  }, [reduced, onArrive]);

  const style = {
    "--walk-ms": `${WALK_MS}ms`,
    "--from": `${from}%`,
    "--to": `${to}%`,
  } as CSSProperties;

  return (
    <section className="panel screen-enter" data-track={track}>
      <h1 className="room__title">{roomIndex === 0 ? "Sneaking into the building" : "On to the next room"}</h1>
      <p className="lead">
        Room {roomIndex + 1} of {levels.length}: {level.title}. Topic: {level.topic}.
      </p>
      <p className="visually-hidden" role="status">Walking to {level.title}</p>

      {/* Purely decorative scene; the text above carries the meaning. */}
      <div className="corridor" style={style} aria-hidden="true">
        <div className="corridor__lights"><i /><i /><i /><i /></div>
        <ol className="corridor__doors">
          {levels.map((door, index) => (
            <li
              key={door.id}
              className={`door ${index < roomIndex ? "door--done" : ""} ${index === roomIndex ? "door--current" : ""} ${index === roomIndex && open ? "door--open" : ""}`}
            >
              <span className="door__frame">
                <span className="door__panel" />
              </span>
              <span className="door__num">{index + 1}</span>
            </li>
          ))}
        </ol>
        <div className="player" key={roomIndex}>
          <SpeechBubble className={`player__bubble ${nearRightEdge ? "player__bubble--left" : ""}`}>
            {roomIndex === 0 ? FIRST_DOOR_LINE : NEXT_DOOR_LINE}
          </SpeechBubble>
          <Player walking={!open} />
        </div>
        <div className="corridor__floor" />
      </div>

      <div className="actions">
        <Button variant="ghost" onClick={onArrive}>Skip animation</Button>
      </div>
    </section>
  );
}
