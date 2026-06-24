"use client";

import { useState, useEffect, useRef } from "react";
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
  viewMode: "auto" | "grid" | "speaker";
  onViewModeChange: (mode: "auto" | "grid" | "speaker") => void;
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
  viewMode,
  onViewModeChange,
}: ConferenceControlsProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) {
        setShowViewMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <footer className="meet-bottom-bar fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.06] bg-[#161b22]/98 backdrop-blur-xl">
      {/* Pen color picker (shows when pen is active) */}
      {penActive && hasScreenShare && (
        <div className="flex items-center justify-center gap-3 border-b border-white/[0.04] px-4 py-1.5">
          <span className="text-[11px] font-medium tracking-wide text-gray-500">PEN</span>
          {PEN_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onPenColorChange(c)}
              className="group relative flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`block h-4 w-4 rounded-full transition-transform group-hover:scale-110 ${
                  penColor === c ? "ring-2 ring-white ring-offset-1 ring-offset-[#161b22]" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            </button>
          ))}
          <div className="mx-1 h-4 w-px bg-white/10" />
          <button
            type="button"
            onClick={onClearDrawing}
            className="rounded-md bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-gray-400 hover:bg-white/10 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {/* Main control row */}
      <div className="mx-auto flex max-w-5xl items-center justify-between px-2 py-2 sm:px-4">
        {/* Left: media controls */}
        <div className="flex items-center gap-1.5">
          <TrackToggle
            source={Track.Source.Microphone}
            className="meet-media-btn"
            showIcon
          />
          <TrackToggle
            source={Track.Source.Camera}
            className="meet-media-btn"
            showIcon
          />
          <TrackToggle
            source={Track.Source.ScreenShare}
            className="meet-media-btn"
            showIcon
          />
        </div>

        {/* Center: action buttons */}
        <div className="flex items-center gap-1">
          {/* Emoji reactions */}
          <div className="relative" ref={emojiRef}>
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className={`meet-action-btn ${showEmoji ? "!bg-white/15" : ""}`}
              title="Reactions"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </button>
            {showEmoji && (
              <div className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 gap-0.5 rounded-2xl border border-white/10 bg-[#1c2333] p-1.5 shadow-2xl">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onSendEmoji(emoji);
                      setShowEmoji(false);
                    }}
                    className="rounded-xl px-2 py-1.5 text-xl transition-transform hover:scale-125 hover:bg-white/10"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Raise hand */}
          <button
            type="button"
            onClick={onToggleRaiseHand}
            className={`meet-action-btn ${handRaised ? "meet-action-btn-active !bg-amber-500/20 !text-amber-400" : ""}`}
            title="Raise hand (H)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-4 0v1"/>
              <path d="M14 10V4a2 2 0 0 0-4 0v2"/>
              <path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
            </svg>
          </button>

          {/* Pen tool (only when screen share active) */}
          {hasScreenShare && (
            <button
              type="button"
              onClick={onTogglePen}
              className={`meet-action-btn ${penActive ? "meet-action-btn-active !bg-corator-600/30 !text-corator-400" : ""}`}
              title="Draw on screen (D)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          )}

          <div className="mx-0.5 h-5 w-px bg-white/[0.06]" />

          {/* Chat */}
          <button
            type="button"
            onClick={onToggleChat}
            className={`meet-action-btn relative ${activePanel === "chat" ? "meet-action-btn-active" : ""}`}
            title="Chat (C)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {chatUnread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold">
                {chatUnread}
              </span>
            )}
          </button>

          {/* AI Notes */}
          <button
            type="button"
            onClick={onToggleNotes}
            className={`meet-action-btn hidden sm:inline-flex ${activePanel === "notes" ? "meet-action-btn-active" : ""}`}
            title="AI Notes"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </button>

          {/* People */}
          <button
            type="button"
            onClick={onTogglePeople}
            className={`meet-action-btn relative ${activePanel === "people" ? "meet-action-btn-active" : ""}`}
            title="People"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {isHost && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold">★</span>
            )}
          </button>

          {/* View toggle */}
          <div className="relative" ref={viewRef}>
            <button
              type="button"
              onClick={() => setShowViewMenu((v) => !v)}
              className={`meet-action-btn hidden sm:inline-flex ${showViewMenu ? "!bg-white/15" : ""}`}
              title="Layout"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            {showViewMenu && (
              <div className="absolute bottom-full left-1/2 mb-2 w-36 -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-[#1c2333] py-1 shadow-2xl">
                {(["auto", "grid", "speaker"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      onViewModeChange(mode);
                      setShowViewMenu(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm capitalize hover:bg-white/[0.06] ${
                      viewMode === mode ? "text-corator-400" : "text-gray-300"
                    }`}
                  >
                    {viewMode === mode && (
                      <span className="text-corator-400">✓</span>
                    )}
                    <span className={viewMode === mode ? "" : "ml-5"}>{mode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: leave */}
        <div className="flex items-center">
          <DisconnectButton className="meet-leave-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 17l5-5-5-5"/>
              <path d="M21 12H9"/>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            </svg>
            <span className="hidden sm:inline">Leave</span>
          </DisconnectButton>
        </div>
      </div>
    </footer>
  );
}
