import { Button } from "./common/Button";

interface StartScreenProps {
  bestScore: number;
  roomCount: number;
  onStart: () => void;
}

/** Welcome screen with the rules in three short steps. */
export function StartScreen({ bestScore, roomCount, onStart }: StartScreenProps) {
  return (
    <section className="panel panel--center">
      <h1 className="title">Code Heist</h1>
      <p className="lead">Break through {roomCount} rooms by finding the bug in each snippet before the alarm sounds.</p>
      <ol className="steps">
        <li>Click the buggy line of code.</li>
        <li>Choose the correct fix.</li>
        <li>Faster solves and fewer hints score higher.</li>
      </ol>
      {bestScore > 0 && <p className="muted">Best score: {bestScore}</p>}
      <Button onClick={onStart} autoFocus>Start the heist</Button>
    </section>
  );
}
