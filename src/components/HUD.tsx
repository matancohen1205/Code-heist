import { ROOM_SECONDS } from "../core/scoring/calculateScore";

interface HUDProps {
  room: number;
  totalRooms: number;
  timeLeft: number;
  score: number;
}

/** Top bar: room progress, score and a countdown bar. */
export function HUD({ room, totalRooms, timeLeft, score }: HUDProps) {
  const percent = Math.round((timeLeft / ROOM_SECONDS) * 100);
  const urgent = timeLeft <= 10;
  return (
    <header className="hud">
      <p className="hud__item">
        Room {room} / {totalRooms}
      </p>
      <p className="hud__item">Score: {score}</p>
      <p className={`hud__item ${urgent ? "hud__item--urgent" : ""}`}>
        <span className="visually-hidden">Time left: </span>
        {timeLeft}s
      </p>
      <div className="hud__bar" role="progressbar" aria-label="Time left" aria-valuemin={0} aria-valuemax={ROOM_SECONDS} aria-valuenow={timeLeft}>
        <div className={`hud__fill ${urgent ? "hud__fill--urgent" : ""}`} style={{ width: `${percent}%` }} />
      </div>
    </header>
  );
}
