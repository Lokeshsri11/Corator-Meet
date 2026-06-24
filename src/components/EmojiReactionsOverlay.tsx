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
        <div
          key={item.id}
          className="emoji-float absolute flex flex-col items-center"
          style={{
            left: `${15 + (index * 17) % 70}%`,
            bottom: "15%",
          }}
        >
          <span className="text-4xl drop-shadow-lg">{item.emoji}</span>
          <span className="mt-0.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
            {item.sender}
          </span>
        </div>
      ))}
    </div>
  );
}
