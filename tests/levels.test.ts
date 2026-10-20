import { describe, expect, it } from "vitest";
import { DIFFICULTIES, TRACKS, countByDifficulty, getLevels } from "../src/core/levels";

/** Data-integrity checks so a typo in a level never ships. */
describe.each(TRACKS)("$label levels", ({ id }) => {
  const levels = getLevels(id);

  it("has unique ids", () => {
    expect(new Set(levels.map((level) => level.id)).size).toBe(levels.length);
  });

  it.each(DIFFICULTIES)("has at least two %s rooms", (tier) => {
    expect(countByDifficulty(id)[tier]).toBeGreaterThanOrEqual(2);
  });

  it.each(levels)("$id is well-formed", (level) => {
    expect(level.bugLine).toBeGreaterThanOrEqual(0);
    expect(level.bugLine).toBeLessThan(level.lines.length);
    expect(level.fixes.map((fix) => fix.id)).toContain(level.correctFixId);
    expect(level.fixes.length).toBeGreaterThanOrEqual(2);
    // The correct fix must actually change the buggy line.
    const correct = level.fixes.find((fix) => fix.id === level.correctFixId)!;
    expect(correct.text).not.toBe(level.lines[level.bugLine]);
  });
});
