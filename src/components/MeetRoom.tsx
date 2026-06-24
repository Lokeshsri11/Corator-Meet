"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { LocalUserChoices } from "@livekit/components-react";
import { DisconnectReason } from "livekit-client";
import type { ConnectionDetails } from "@/lib/types";
import { getLiveKitRoomOptions } from "@/lib/livekit";
import { MeetConference } from "@/components/MeetConference";

type MeetRoomProps = {
  choices: LocalUserChoices;
  details: ConnectionDetails;
  onLeave: () => void;
};

function disconnectLabel(reason?: DisconnectReason): string {
  if (reason === undefined) return "Connection lost";
  return DisconnectReason[reason] ?? "Connection lost";
}

export function MeetRoom({ choices, details, onLeave }: MeetRoomProps) {
  const roomOptions = useMemo(() => getLiveKitRoomOptions(), []);
  const leaveRequested = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const handleLeave = useCallback(() => {
    leaveRequested.current = true;
    onLeave();
  }, [onLeave]);

  const handleDisconnected = useCallback((reason?: DisconnectReason) => {
    if (leaveRequested.current) return;
    setError(disconnectLabel(reason));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1117] px-4">
        <div className="max-w-sm rounded-2xl border border-white/[0.06] bg-[#161b22] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-400">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-100">Disconnected</h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-corator-600 py-2.5 text-sm font-medium text-white hover:bg-corator-500"
            >
              Rejoin
            </button>
            <button
              type="button"
              onClick={onLeave}
              className="rounded-xl border border-white/[0.08] py-2.5 text-sm text-gray-400 hover:bg-white/[0.04]"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={details.participantToken}
      serverUrl={details.serverUrl}
      connect={true}
      audio={choices.audioEnabled}
      video={choices.videoEnabled}
      options={roomOptions}
      onDisconnected={handleDisconnected}
      onError={(err) => setError(err.message)}
      data-lk-theme="default"
      className="h-dvh overflow-hidden bg-[#0d1117]"
    >
      <MeetConference
        participantName={details.participantName}
        roomName={details.roomName}
        isHost={details.isHost ?? false}
        onLeave={handleLeave}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
