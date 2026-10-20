interface PlayerProps {
  walking: boolean;
}

/** Small masked-thief character; legs and body animate while walking. */
export function Player({ walking }: PlayerProps) {
  return (
    <svg className={`player__svg ${walking ? "player__svg--walking" : ""}`} viewBox="0 0 40 64" width="40" height="64" aria-hidden="true">
      <rect className="player__leg player__leg--a" x="12" y="40" width="7" height="20" rx="3" />
      <rect className="player__leg player__leg--b" x="21" y="40" width="7" height="20" rx="3" />
      <g className="player__body">
        <rect className="player__torso" x="10" y="20" width="20" height="24" rx="6" />
        <circle className="player__head" cx="20" cy="12" r="9" />
        <rect className="player__mask" x="11" y="9" width="18" height="5" rx="2" />
      </g>
    </svg>
  );
}
