import { useEffect, useState, type CSSProperties } from "react";
import type { Level } from "../core/types";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { Button } from "./common/Button";
import { Player } from "./Player";

const WALK_MS = 1800; // time the player walks to the next door
const OPEN_MS = 700; // time the door takes to open before the room appears
const ENTRANCE_PERCENT = 3; // where the player starts before the first door

interface CorridorScreenProps {
  levels: Level[];
  roomIndex: number; // the room the player is walking toward
  onArrive: () => void;
}

/** Horizontal position (percent) of the centre of door `index`. */
function doorPercent(index: number, total: number): number {
  return ((index + 0.5) / total) * 100;
}

/** Animated corridor: the player walks to the next door, which opens. */
export function CorridorScreen({ levels, roomIndex, onArrive }: CorridorScreenProps) {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const level = levels[roomIndex];
  const from = roomIndex === 0 ? ENTRANCE_PERCENT : doorPercent(roomIndex - 1, levels.length);
  const to = doorPercent(roomIndex, levels.length);

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
    <section className="panel screen-enter">
      <h1 className="room__title">{roomIndex === 0 ? "Sneaking into the building" : "On to the next room"}</h1>
      <p className="lead">
        Room {roomIndex + 1} of {levels.length}: {level.title}. Topic: {level.topic}.
      </p>
      <p className="visually-hidden" role="status">Walking to {level.title}</p>

      {/* Purely decorative scene; the text above carries the meaning. */}
      <div className="corridor" style={style} aria-hidden="true">
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
