const BEST_SCORE_KEY = "code-heist:best-score";

/** Reads the saved best score; returns 0 when storage is unavailable. */
export function loadBestScore(): number {
  try {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const value = raw === null ? 0 : Number(raw);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

/** Saves the score if it beats the stored best; returns the new best. */
export function saveBestScore(score: number): number {
  const best = Math.max(score, loadBestScore());
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(best));
  } catch {
    // Storage may be blocked (private mode); the game still works without it.
  }
  return best;
}
