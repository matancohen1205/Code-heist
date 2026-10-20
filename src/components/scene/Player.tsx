interface PlayerProps {
  walking?: boolean;
  talking?: boolean;
}

/** Sam, the masked guide. Legs and arms swing while walking; the mouth moves while talking. */
export function Player({ walking = false, talking = false }: PlayerProps) {
  const classes = ["player__svg", walking && "player__svg--walking", talking && "player__svg--talking"]
    .filter(Boolean)
    .join(" ");
  return (
    <svg className={classes} viewBox="0 0 48 68" width="48" height="68" aria-hidden="true">
      <rect className="player__leg player__leg--a" x="14" y="44" width="8" height="20" rx="3" />
      <rect className="player__leg player__leg--b" x="26" y="44" width="8" height="20" rx="3" />
      <rect className="player__arm player__arm--a" x="6" y="25" width="7" height="18" rx="3.5" />
      <g className="player__body">
        <rect className="player__torso" x="12" y="24" width="24" height="26" rx="7" />
        <rect className="player__belt" x="12" y="42" width="24" height="3" />
        <circle className="player__head" cx="24" cy="14" r="10" />
        <path className="player__hair" d="M14 12 Q24 0 34 12 Q24 6 14 12Z" />
        <rect className="player__mask" x="14" y="10" width="20" height="6" rx="3" />
        <rect className="player__mouth" x="21" y="19" width="6" height="2.5" rx="1.2" />
      </g>
      <rect className="player__arm player__arm--b" x="35" y="25" width="7" height="18" rx="3.5" />
    </svg>
  );
}
