"use client";

import { ConnectionQuality as CQ } from "livekit-client";
import {
  useConnectionQualityIndicator,
  useRoomContext,
} from "@livekit/components-react";

export function ConnectionQualityBadge() {
  const room = useRoomContext();
  const { quality } = useConnectionQualityIndicator({
    participant: room.localParticipant,
  });

  const label =
    quality === CQ.Excellent ? "Excellent" :
    quality === CQ.Good ? "Good" :
    quality === CQ.Poor ? "Poor" :
    "Unknown";

  const dotColor =
    quality === CQ.Excellent ? "bg-emerald-400" :
    quality === CQ.Good ? "bg-yellow-400" :
    quality === CQ.Poor ? "bg-red-400" :
    "bg-gray-400";

  return (
    <div className="flex items-center gap-1.5" title={`Connection: ${label}`}>
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      <span className="text-[11px] text-gray-400">{label}</span>
    </div>
  );
}
