"use client";

import { useParticipants } from "@livekit/components-react";
import { ConnectionQuality, Track } from "livekit-client";

type ParticipantsPanelProps = {
  isHost: boolean;
  roomName: string;
  raisedHands: Record<string, string>;
  onClose: () => void;
};

function qualityDot(quality: ConnectionQuality) {
  if (quality === ConnectionQuality.Excellent) return "bg-emerald-400";
  if (quality === ConnectionQuality.Good) return "bg-yellow-400";
  if (quality === ConnectionQuality.Poor) return "bg-red-400";
  return "bg-gray-500";
}

export function ParticipantsPanel({
  isHost,
  roomName,
  raisedHands,
  onClose,
}: ParticipantsPanelProps) {
  const participants = useParticipants();

  async function toggleMute(identity: string, currentlyMuted: boolean) {
    await fetch("/api/room/mute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName,
        participantIdentity: identity,
        muted: !currentlyMuted,
        isHost,
      }),
    });
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-100">People</h2>
          <p className="text-[11px] text-gray-500">{participants.length} in call</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-white/[0.06] hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-1">
        {participants.map((p) => {
          const micPub = p.getTrackPublication(Track.Source.Microphone);
          const camPub = p.getTrackPublication(Track.Source.Camera);
          const isMuted = micPub?.isMuted ?? !micPub?.isEnabled;
          const camOff = camPub?.isMuted ?? !camPub?.isEnabled;
          const isLocal = p.isLocal;
          const handRaised = raisedHands[p.identity];

          return (
            <div
              key={p.identity}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.04]"
            >
              {/* Avatar */}
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-corator-600/20 text-xs font-semibold text-corator-400">
                {(p.name || p.identity).charAt(0).toUpperCase()}
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#161b22] ${qualityDot(p.connectionQuality)}`} />
              </div>

              {/* Name and status */}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm text-gray-200">
                  {p.name || p.identity}
                  {isLocal && <span className="text-[10px] text-gray-500">(you)</span>}
                  {handRaised && <span className="text-xs">✋</span>}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span className={isMuted ? "text-red-400/70" : "text-emerald-400/70"}>
                    {isMuted ? "Muted" : "Mic on"}
                  </span>
                  <span className={camOff ? "text-red-400/70" : "text-emerald-400/70"}>
                    {camOff ? "Cam off" : "Cam on"}
                  </span>
                </div>
              </div>

              {/* Host mute control */}
              {isHost && !isLocal && micPub && (
                <button
                  type="button"
                  onClick={() => void toggleMute(p.identity, isMuted)}
                  className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100 ${
                    isMuted
                      ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                      : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                  }`}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
