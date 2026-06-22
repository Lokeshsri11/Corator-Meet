"use client";

import { useParticipants } from "@livekit/components-react";
import { Track } from "livekit-client";

type ParticipantsPanelProps = {
  isHost: boolean;
  roomName: string;
  raisedHands: Record<string, string>;
  onClose: () => void;
};

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
    <aside className="flex h-full w-72 flex-col border-l border-white/10 bg-[#0f1524]">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">People ({participants.length})</h2>
          {isHost && (
            <p className="text-xs text-corator-300">You are the host</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-white/5"
        >
          Close
        </button>
      </header>

      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
        {participants.map((p) => {
          const micPub = p.getTrackPublication(Track.Source.Microphone);
          const isMuted = micPub?.isMuted ?? !micPub?.isEnabled;
          const isLocal = p.isLocal;
          const handRaised = raisedHands[p.identity];

          return (
            <div
              key={p.identity}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {p.name || p.identity}
                  {isLocal && (
                    <span className="ml-1 text-xs text-gray-400">(you)</span>
                  )}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                  {isMuted ? "Muted" : "Mic on"}
                  {handRaised && (
                    <span className="text-amber-400">✋ Raised</span>
                  )}
                </div>
              </div>
              {isHost && !isLocal && micPub && (
                <button
                  type="button"
                  onClick={() => void toggleMute(p.identity, isMuted)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
                    isMuted
                      ? "bg-green-600/80 hover:bg-green-600"
                      : "bg-amber-600/80 hover:bg-amber-600"
                  }`}
                >
                  {isMuted ? "Unmute" : "Mute"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
