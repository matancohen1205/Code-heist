import type { ReactNode } from "react";

interface SpeechBubbleProps {
  children: ReactNode;
  className?: string;
}

/** Comic-style bubble whose tail points at the speaker on the left. */
export function SpeechBubble({ children, className = "" }: SpeechBubbleProps) {
  return <div className={`bubble ${className}`}>{children}</div>;
}
