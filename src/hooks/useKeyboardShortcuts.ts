"use client";

import { useEffect } from "react";
import { Room, Track } from "livekit-client";

type ShortcutHandlers = {
  room: Room | undefined;
  onToggleChat: () => void;
  onToggleRaiseHand: () => void;
  onTogglePen: () => void;
  hasScreenShare: boolean;
};

export function useKeyboardShortcuts({
  room,
  onToggleChat,
  onToggleRaiseHand,
  onTogglePen,
  hasScreenShare,
}: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "m": {
          if (!room) return;
          const mic = room.localParticipant.getTrackPublication(Track.Source.Microphone);
          if (mic) {
            void room.localParticipant.setMicrophoneEnabled(!mic.isEnabled);
          }
          break;
        }
        case "v": {
          if (!room) return;
          const cam = room.localParticipant.getTrackPublication(Track.Source.Camera);
          if (cam) {
            void room.localParticipant.setCameraEnabled(!cam.isEnabled);
          }
          break;
        }
        case "h":
          onToggleRaiseHand();
          break;
        case "c":
          if (!e.ctrlKey && !e.metaKey) onToggleChat();
          break;
        case "d":
          if (hasScreenShare) onTogglePen();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [room, onToggleChat, onToggleRaiseHand, onTogglePen, hasScreenShare]);
}
