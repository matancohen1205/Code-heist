# Code Heist

A bug-fixing escape game for developers. Break through five rooms: find the buggy line, pick the correct fix, and beat the clock.

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
│   │   ├── CodeViewer.tsx, FixOptions.tsx, HUD.tsx
│   │   └── StartScreen.tsx, RoomScreen.tsx, ResultScreen.tsx
│   ├── core/            # pure business logic, framework-free
│   │   ├── engine/      # gameReducer (state machine), checkAnswer
│   │   ├── scoring/     # calculateScore, ranks
│   │   ├── levels/      # level data
│   │   └── types.ts
│   ├── hooks/useGame.ts # bridge: reducer + timer -> React
│   ├── services/storage.ts # localStorage access (best score)
│   └── styles/          # design tokens (light/dark) + global CSS
└── tests/               # unit tests for core logic
```

## Accessibility

- Every interaction is a real button, fully keyboard operable.
- Visible focus ring, 44px touch targets, light and dark themes via design tokens.
- Feedback is announced through an `aria-live` region; the timer is exposed as a progressbar.
- Respects `prefers-reduced-motion`.

## Adding a room

Add an entry to `src/core/levels/levels.ts` with the snippet, the buggy line index, fix options and an explanation. No other file needs to change.
