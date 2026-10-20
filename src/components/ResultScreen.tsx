import { rankFor } from "../core/scoring/calculateScore";
import { Button } from "./common/Button";

interface ResultScreenProps {
  score: number;
  bestScore: number;
  solved: number;
  roomCount: number;
  onRestart: () => void;
}

/** Final summary with a shareable rank. */
export function ResultScreen({ score, bestScore, solved, roomCount, onRestart }: ResultScreenProps) {
  return (
    <section className="panel panel--center">
      <h1 className="title">Heist complete</h1>
      <p className="rank">{rankFor(score, roomCount)}</p>
      <p className="lead">
        {solved} of {roomCount} rooms cleared with {score} points.
      </p>
      <p className="muted">Best score: {bestScore}</p>
      <Button onClick={onRestart} autoFocus>Play again</Button>
    </section>
  );
}
