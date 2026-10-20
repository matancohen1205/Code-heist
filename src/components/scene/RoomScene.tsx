import type { ReactNode } from "react";
import type { Track } from "../../core/types";
import { getTrackInfo } from "../../core/levels";
import { Player } from "./Player";

interface RoomSceneProps {
  track: Track;
  talking: boolean;
  speech: ReactNode; // what the guide says, shown in the bubble
  children: ReactNode; // the monitor
}

/** A themed office room: decorated wall, desk with the monitor, and the guide on the floor. */
export function RoomScene({ track, talking, speech, children }: RoomSceneProps) {
  const { icon } = getTrackInfo(track);
  return (
    <div className="room-scene" data-track={track}>
      <div className="room-scene__wall" aria-hidden="true">
        <div className="decor-window"><span className="decor-window__sun" /></div>
        <div className="decor-poster"><span>{icon}</span></div>
        <div className="decor-clock" />
        <div className="decor-shelf"><i /><i /><i /><b /></div>
      </div>

      <div className="room-scene__desk">
        {children}
        <div className="desk-top" aria-hidden="true"><span className="desk-top__keys" /><span className="desk-top__mug" /></div>
        <div className="desk-front" aria-hidden="true" />
      </div>

      <div className="room-scene__floor">
        <div className="room-scene__actor">
          <Player talking={talking} />
        </div>
        <div className="room-scene__speech">{speech}</div>
      </div>
    </div>
  );
}
