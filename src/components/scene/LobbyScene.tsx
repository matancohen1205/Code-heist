import type { ReactNode } from "react";

interface LobbySceneProps {
  children: ReactNode; // the guide and the speech bubble
}

/** Night-time lobby backdrop with a neon sign, skyline and reception desk. */
export function LobbyScene({ children }: LobbySceneProps) {
  return (
    <div className="lobby">
      <div className="lobby__stars" aria-hidden="true" />
      <div className="lobby__skyline" aria-hidden="true" />
      <p className="lobby__sign" aria-hidden="true">CODE HEIST</p>
      <div className="lobby__desk" aria-hidden="true" />
      <div className="lobby__plant" aria-hidden="true" />
      <div className="lobby__floor" aria-hidden="true" />
      {children}
    </div>
  );
}
