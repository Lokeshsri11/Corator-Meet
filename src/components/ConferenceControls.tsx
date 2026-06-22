"use client";

import { useState } from "react";
import { TrackToggle, DisconnectButton } from "@livekit/components-react";
import { Track } from "livekit-client";
import { REACTION_EMOJIS } from "@/lib/signals";

type SidePanel = "chat" | "notes" | "people" | null;

const PEN_COLORS = ["#3386fc", "#ef4444", "#22c55e", "#f59e0b", "#ffffff"];

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
  hasScreenShare: boolean;
  penActive: boolean;
  penColor: string;
  onTogglePen: () => void;
  onPenColorChange: (color: string) => void;
  onClearDrawing: () => void;
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
  hasScreenShare,
  penActive,
  penColor,
  onTogglePen,
  onPenColorChange,
  onClearDrawing,
}: ConferenceControlsProps) {
  const [showEmoji, setShowEmoji] = useState(false);

  return (
    <footer className="meet-bottom-bar fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0e18]/98 backdrop-blur-xl">
      {penActive && hasScreenShare && (
        <div className="flex items-center justify-center gap-2 border-b border-white/5 px-4 py-2">
          <span className="text-xs text-gray-400">Pen color</span>
          {PEN_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onPenColorChange(c)}
              className={`h-5 w-5 rounded-full border-2 ${
                penColor === c ? "border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <button
            type="button"
            onClick={onClearDrawing}
            className="ml-2 rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="mx-auto flex max-w-4xl items-center justify-center gap-1 px-3 py-2.5 sm:gap-2 sm:px-4">
        <TrackToggle source={Track.Source.Microphone} className="meet-icon-btn" showIcon />
        <TrackToggle source={Track.Source.Camera} className="meet-icon-btn" showIcon />
        <TrackToggle source={Track.Source.ScreenShare} className="meet-icon-btn" showIcon />

        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="meet-icon-btn text-lg"
            title="Reactions"
          >
            😊
          </button>
          {showEmoji && (
            <div className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 gap-1 rounded-xl border border-white/10 bg-[#0f1524] p-2 shadow-xl">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSendEmoji(emoji);
                    setShowEmoji(false);
                  }}
                  className="rounded-lg px-1.5 py-1 text-xl hover:bg-white/10"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleRaiseHand}
          className={`meet-icon-btn ${handRaised ? "!bg-amber-500/90" : ""}`}
          title="Raise hand"
        >
          ✋
        </button>

        {hasScreenShare && (
          <button
            type="button"
            onClick={onTogglePen}
            className={`meet-icon-btn ${penActive ? "!bg-corator-600" : ""}`}
            title="Draw on shared screen"
          >
            ✏️
          </button>
        )}

        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />

        <button
          type="button"
          onClick={onToggleChat}
          className={`meet-text-btn relative ${activePanel === "chat" ? "!bg-corator-600" : ""}`}
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
          className={`meet-text-btn hidden sm:inline-flex ${activePanel === "notes" ? "!bg-corator-600" : ""}`}
        >
          Notes
        </button>

        <button
          type="button"
          onClick={onTogglePeople}
          className={`meet-text-btn ${activePanel === "people" ? "!bg-corator-600" : ""}`}
        >
          People{isHost ? " ★" : ""}
        </button>

        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />

        <DisconnectButton className="meet-leave-btn">Leave</DisconnectButton>
      </div>
    </footer>
  );
}
