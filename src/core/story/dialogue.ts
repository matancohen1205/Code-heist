/** What the guide character says during the welcome scene. */
export const WELCOME_LINES: string[] = [
  "Hey, I'm Sam! Welcome to Code Heist.",
  "This building is full of locked rooms. Every room has a computer, and every computer has a bug in its code.",
  "Click the buggy line, pick the right fix, and the next door unlocks. But keep an eye on the clock!",
  "Pick a topic and how hard you want it. I'll lead the way.",
];

/** Shown while the guide waits for the player to choose a path. */
export const CHOOSE_PATH_LINE = "So, where to first?";

/** Short remarks while walking between rooms. */
export const FIRST_DOOR_LINE = "Follow me!";
export const NEXT_DOOR_LINE = "Next door...";

/** What the guide says in a room before the player acts. */
export const ROOM_PROMPTS = {
  findBug: "Click the line that looks buggy.",
  chooseFix: "Now pick the fix that works.",
  solved: "Nice work!",
  failed: "Out of time. Here is what went wrong.",
} as const;
