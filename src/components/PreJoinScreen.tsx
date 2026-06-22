"use client";

import { useEffect, useState } from "react";
import {
  LocalUserChoices,
  PreJoin,
} from "@livekit/components-react";
import type { ConnectionDetails } from "@/lib/types";

type PreJoinScreenProps = {
  roomName: string;
  isHost?: boolean;
  onJoin: (choices: LocalUserChoices, details: ConnectionDetails) => void;
  onBack: () => void;
};

export function PreJoinScreen({ roomName, isHost = false, onJoin, onBack }: PreJoinScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  async function handlePreJoin(choices: LocalUserChoices) {
    if (!choices.username?.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          participantName: choices.username.trim(),
          isHost,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to get access token");
      }

      const details = (await response.json()) as ConnectionDetails;
      onJoin(choices, details);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
      setIsJoining(false);
    }
  }

  useEffect(() => {
    document.title = `${roomName} · Corator Meet`;
  }, [roomName]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#1d3a6b,transparent_45%),#0b0f19] px-4">
      <div className="w-full max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm text-gray-400 hover:text-white"
        >
          ← Back to home
        </button>

        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-corator-300">
            Joining room
          </p>
          <h1 className="mt-2 font-mono text-3xl font-semibold tracking-wide text-white">
            {roomName}
          </h1>
          <p className="mt-2 text-gray-400">
            Check your camera and microphone before entering.
          </p>
          {isHost && (
            <p className="mt-2 text-sm text-amber-300">
              You will join as the meeting host.
            </p>
          )}
        </div>

        <div className="corator-prejoin rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <PreJoin
            defaults={{
              username: "",
              videoEnabled: true,
              audioEnabled: true,
            }}
            onSubmit={handlePreJoin}
            onError={(err) => setError(err.message)}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {isJoining && (
          <p className="mt-4 text-center text-sm text-gray-400">
            Connecting to LiveKit...
          </p>
        )}
      </div>
    </div>
  );
}
