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
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h2 className="text-xl font-semibold">Could not stay in the call</h2>
          <p className="mt-3 text-sm text-gray-400">{error}</p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-corator-600 py-3 font-medium hover:bg-corator-500"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onLeave}
              className="rounded-xl border border-white/10 py-3 text-sm text-gray-300 hover:bg-white/5"
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
      className="h-dvh overflow-hidden bg-[#0b0f19]"
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
