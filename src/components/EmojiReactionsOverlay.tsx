"use client";

import type { FloatingEmoji } from "@/hooks/useRoomSignals";

type EmojiReactionsOverlayProps = {
  emojis: FloatingEmoji[];
};

export function EmojiReactionsOverlay({ emojis }: EmojiReactionsOverlayProps) {
  if (emojis.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {emojis.map((item, index) => (
        <span
          key={item.id}
          className="emoji-float absolute text-4xl"
          style={{
            left: `${15 + (index * 17) % 70}%`,
            bottom: "20%",
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
