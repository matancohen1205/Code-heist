import { rankFor } from "../core/scoring/calculateScore";
import { getTrackInfo } from "../core/levels";
import type { DifficultyFilter, Level, RoomResult, Track } from "../core/types";
import { Button } from "./common/Button";

interface ResultScreenProps {
  track: Track;
  difficulty: DifficultyFilter;
  score: number;
  bestScore: number;
  levels: Level[];
  results: RoomResult[];
  onRestart: () => void;
}

/** Final summary with a shareable rank and a per-concept study review. */
export function ResultScreen({ track, difficulty, score, bestScore, levels, results, onRestart }: ResultScreenProps) {
  const solved = results.filter((result) => result.solved).length;
  return (
    <section className="panel panel--center screen-enter">
      <h1 className="title">Heist complete</h1>
      <p className="muted">
        {getTrackInfo(track).label} · {difficulty === "all" ? "Full journey" : `${difficulty} only`}
      </p>
      <p className="rank">{rankFor(score, levels.length)}</p>
      <p className="lead">
        {solved} of {levels.length} rooms cleared with {score} points.
      </p>
      <p className="muted">Best score: {bestScore}</p>

      <h2 className="fixes__title">What you practiced</h2>
      <ul className="review">
        {results.map((result) => {
          const level = levels.find((item) => item.id === result.levelId);
          if (!level) return null;
          return (
            <li key={result.levelId} className="review__item">
              <p className="review__head">
                <strong>{level.topic}</strong>
                <span className={`badge ${result.solved ? "badge--ok" : "badge--miss"}`}>
                  {result.solved ? "Cleared" : "Missed"}
                </span>
              </p>
              <p className="muted">{level.explanation}</p>
            </li>
          );
        })}
      </ul>

      <Button onClick={onRestart} autoFocus>Choose another path</Button>
    </section>
  );
}
