interface CodeViewerProps {
  lines: string[];
  bugLine: number;
  interactive: boolean; // true while the player is hunting for the bug
  revealBug: boolean; // highlight the buggy line once found or failed
  replacement?: string; // fixed text shown after the room is solved
  onSelect: (index: number) => void;
}

/** Renders code as a list of selectable lines. */
export function CodeViewer({ lines, bugLine, interactive, revealBug, replacement, onSelect }: CodeViewerProps) {
  return (
    <ol className="code" aria-label="Code to inspect" tabIndex={interactive ? undefined : 0}>
      {lines.map((text, index) => {
        const isBug = revealBug && index === bugLine;
        const shown = replacement !== undefined && index === bugLine ? replacement : text;
        return (
          <li key={index}>
            <button
              type="button"
              className={`code__line ${isBug ? "code__line--bug" : ""} ${replacement !== undefined && index === bugLine ? "code__line--fixed" : ""}`}
              disabled={!interactive}
              onClick={() => onSelect(index)}
            >
              <span className="visually-hidden">Line </span>
              <span className="code__num">{index + 1}</span>
              <code>{shown}</code>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
