# Code Heist

A bug-fixing escape game for students and developers. Walk through the building room by room: in each one, find the buggy line, pick the correct fix, learn the concept behind it, and beat the clock.

- **Two tracks:** JavaScript (8 rooms) and Python (5 rooms), ordered easy to hard.
- **Real bug patterns:** off-by-one, `var` closures, `is` vs `==`, mutable copies, async/await and more.
- **Study summary:** the results screen explains every concept you practiced.
- **Animated corridor** between rooms, with a skip button and full `prefers-reduced-motion` support.

Built with React, TypeScript and Vite. No backend required.

**Play online:** https://matancohen1205.github.io/Code-heist/

## Play locally

```bash
npm install
npm run dev     # start the dev server
npm test        # run unit tests
npm run build   # type-check and build
```

## Architecture

The code follows single-responsibility and strict layer separation: UI never contains game rules, and game rules never import React.

```
├── src/
│   ├── components/      # UI only: renders props, emits callbacks
│   │   ├── common/Button.tsx
│   │   ├── CorridorScreen.tsx, Player.tsx   # animated walk between rooms
│   │   ├── CodeViewer.tsx, FixOptions.tsx, HUD.tsx
│   │   └── StartScreen.tsx, RoomScreen.tsx, ResultScreen.tsx
│   ├── core/            # pure business logic, framework-free
│   │   ├── engine/      # gameReducer (state machine), checkAnswer
│   │   ├── scoring/     # calculateScore, ranks
│   │   ├── levels/      # javascript.ts, python.ts, index.ts (track registry)
│   │   └── types.ts
│   ├── hooks/           # useGame (reducer + timer), usePrefersReducedMotion
│   ├── services/storage.ts # localStorage access (best score)
│   └── styles/          # design tokens, global CSS, animations
└── tests/               # reducer tests and level data-integrity tests
```


## Accessibility

- Every interaction is a real button, fully keyboard operable.
- Visible focus ring, 44px touch targets, light and dark themes via design tokens.
- Feedback is announced through an `aria-live` region; the timer is exposed as a progressbar.
- Respects `prefers-reduced-motion`: the corridor is skipped and animations are disabled.
- The decorative corridor is hidden from assistive tech; a text status announces the destination.
- Audited with axe-core in light and dark themes: no violations.

## Adding a room or a language

Add an entry to `src/core/levels/javascript.ts` or `python.ts` with the snippet, the buggy line index, fix options, topic and explanation. The data-integrity tests in `tests/levels.test.ts` catch mistakes such as a wrong line index or a missing correct fix. To add a new language, create a new level file and register it in `src/core/levels/index.ts`.

Each bug must be fixable by replacing a single line.
