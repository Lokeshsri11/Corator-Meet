"use client";

import { TrackToggle, DisconnectButton } from "@livekit/components-react";
import { Track } from "livekit-client";
import { EmojiBar } from "@/components/EmojiBar";

type SidePanel = "chat" | "notes" | "people" | null;

type ConferenceControlsProps = {
  onToggleChat: () => void;
  onToggleNotes: () => void;
  onTogglePeople: () => void;
  onToggleRaiseHand: () => void;
  onSendEmoji: (emoji: string) => void;
  handRaised: boolean;
  activePanel: SidePanel;
  chatUnread: number;
  isHost: boolean;
};

export function ConferenceControls({
  onToggleChat,
  onToggleNotes,
  onTogglePeople,
  onToggleRaiseHand,
  onSendEmoji,
  handRaised,
  activePanel,
  chatUnread,
  isHost,
}: ConferenceControlsProps) {
  return (
    <div className="border-t border-white/10 bg-[#0a0e18]/95 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-3">
        <div className="flex justify-center">
          <EmojiBar onSelect={onSendEmoji} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <TrackToggle
            source={Track.Source.Microphone}
            className="meet-control-btn"
            showIcon
          />
          <TrackToggle
            source={Track.Source.Camera}
            className="meet-control-btn"
            showIcon
          />
          <TrackToggle
            source={Track.Source.ScreenShare}
            className="meet-control-btn"
            showIcon
          />

          <div className="mx-1 h-8 w-px bg-white/10" />

          <button
            type="button"
            onClick={onToggleRaiseHand}
            className={`meet-control-btn ${handRaised ? "bg-amber-500/90 text-white" : ""}`}
            title="Raise hand"
          >
            <span className="text-lg">✋</span>
            <span className="hidden sm:inline">Raise hand</span>
          </button>

          <button
            type="button"
            onClick={onToggleChat}
            className={`meet-control-btn relative ${activePanel === "chat" ? "bg-corator-600" : ""}`}
          >
            Chat
            {chatUnread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px]">
                {chatUnread}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleNotes}
            className={`meet-control-btn ${activePanel === "notes" ? "bg-corator-600" : ""}`}
          >
            AI Notes
          </button>

          <button
            type="button"
            onClick={onTogglePeople}
            className={`meet-control-btn ${activePanel === "people" ? "bg-corator-600" : ""}`}
          >
            People{isHost ? " ★" : ""}
          </button>

          <div className="mx-1 h-8 w-px bg-white/10" />

          <DisconnectButton className="meet-control-btn !bg-red-500/90 hover:!bg-red-500">
            Leave
          </DisconnectButton>
        </div>
      </div>
    </div>
  );
}
