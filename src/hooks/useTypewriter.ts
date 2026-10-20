import { useEffect, useState } from "react";

/** Reveals `text` one character at a time; `finish` shows all of it at once. */
export function useTypewriter(text: string, enabled: boolean, speedMs = 26) {
  const [count, setCount] = useState(enabled ? 0 : text.length);

  useEffect(() => {
    if (!enabled) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const id = window.setInterval(() => {
      setCount((current) => {
        if (current >= text.length) {
          window.clearInterval(id);
          return current;
        }
        return current + 1;
      });
    }, speedMs);
    return () => window.clearInterval(id);
  }, [text, enabled, speedMs]);

  return {
    shown: text.slice(0, count),
    done: count >= text.length,
    finish: () => setCount(text.length),
  };
}
