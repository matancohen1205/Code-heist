import type { ReactNode } from "react";

interface MonitorProps {
  fileName: string;
  children: ReactNode; // what appears on the screen
}

/** A computer monitor whose screen hosts the question. */
export function Monitor({ fileName, children }: MonitorProps) {
  return (
    <div className="monitor">
      <div className="monitor__bezel">
        <div className="monitor__titlebar">
          <span className="monitor__dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="monitor__file">{fileName}</span>
        </div>
        <div className="monitor__screen">{children}</div>
      </div>
      <div className="monitor__neck" aria-hidden="true" />
      <div className="monitor__base" aria-hidden="true" />
    </div>
  );
}
