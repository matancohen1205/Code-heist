import { useEffect, useState, type CSSProperties } from "react";
import { FIRST_DOOR_LINE, NEXT_DOOR_LINE } from "../core/story/dialogue";
import type { Level, Track } from "../core/types";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { Button } from "./common/Button";
import { Player } from "./scene/Player";
import { SpeechBubble } from "./scene/SpeechBubble";

const WALK_MS = 1800; // time the player walks to the next door
const OPEN_MS = 700; // time the door takes to open before the room appears
const SLOT_OFFSETS = [-1, 0, 1, 2]; // doors shown: the one behind, the next one, two unknown ones
const SLOT_COUNT = SLOT_OFFSETS.length;
const ENTRANCE_PERCENT = 6; // where the player starts before the very first door

interface CorridorScreenProps {
  track: Track;
  levels: Level[];
  roomIndex: number; // the room the player is walking toward
  onArrive: () => void;
}

/** Horizontal position (percent) of the centre of a door slot. */
function slotPercent(slot: number): number {
  return ((slot + 0.5) / SLOT_COUNT) * 100;
}

/**
 * Animated corridor: the guide walks to the next door, which opens onto the room.
 * Only a few doors are drawn and the ones ahead show "?", so the player never
 * learns how many rooms a path has before reaching the end.
 */
export function CorridorScreen({ track, levels, roomIndex, onArrive }: CorridorScreenProps) {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const level = levels[roomIndex];
  const from = roomIndex === 0 ? ENTRANCE_PERCENT : slotPercent(0);
  const to = slotPercent(1);

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
        Room {roomIndex + 1}: {level.title}. Topic: {level.topic}.
      </p>
      <p className="visually-hidden" role="status">Walking to {level.title}</p>

      {/* Purely decorative scene; the text above carries the meaning. */}
      <div className="corridor" style={style} aria-hidden="true">
        <div className="corridor__lights"><i /><i /><i /><i /></div>
        <ol className="corridor__doors">
          {SLOT_OFFSETS.map((offset) => {
            const index = roomIndex + offset;
            const kind = offset < 0 ? "done" : offset === 0 ? "current" : "unknown";
            if (index < 0) return <li key={offset} className="door door--empty" />;
            return (
              <li key={offset} className={`door door--${kind} ${kind === "current" && open ? "door--open" : ""}`}>
                <span className="door__frame">
                  <span className="door__panel" />
                </span>
                <span className="door__num">{kind === "unknown" ? "?" : index + 1}</span>
              </li>
            );
          })}
        </ol>
        <div className="player" key={roomIndex}>
          <SpeechBubble className="player__bubble">
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
