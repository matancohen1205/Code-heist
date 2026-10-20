export const BASE_POINTS = 100;
export const SECOND_BONUS = 2;
export const HINT_PENALTY = 25;
export const MISTAKE_PENALTY = 20;
export const MIN_POINTS = 10;
export const ROOM_SECONDS = 60;

/** Points for solving one room; faster and cleaner solves score higher. */
export function calculateScore(timeLeft: number, hintsUsed: number, mistakes: number): number {
  const raw =
    BASE_POINTS + timeLeft * SECOND_BONUS - hintsUsed * HINT_PENALTY - mistakes * MISTAKE_PENALTY;
  return Math.max(MIN_POINTS, raw);
}

/** Maximum score reachable in a single room (instant, no hints, no mistakes). */
export function maxRoomScore(): number {
  return calculateScore(ROOM_SECONDS, 0, 0);
}

/** Turns a final score into a fun rank for sharing. */
export function rankFor(score: number, roomCount: number): string {
  const ratio = score / (maxRoomScore() * roomCount);
  if (ratio >= 0.8) return "Master Thief";
  if (ratio >= 0.55) return "Sharp Debugger";
  if (ratio >= 0.3) return "Rookie Cracker";
  return "Caught on Camera";
}
