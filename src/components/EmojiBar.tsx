"use client";

import { REACTION_EMOJIS } from "@/lib/signals";

type EmojiBarProps = {
  onSelect: (emoji: string) => void;
};

export function EmojiBar({ onSelect }: EmojiBarProps) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-[#0f1524]/95 px-2 py-1.5 backdrop-blur">
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="rounded-xl px-2 py-1 text-xl transition hover:bg-white/10 hover:scale-110"
          title="Send reaction"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
