"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";

type ChatPanelProps = {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onClose: () => void;
  localIdentity: string;
};

export function ChatPanel({ messages, onSend, onClose, localIdentity }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <aside className="flex h-full w-80 flex-col border-l border-white/10 bg-[#0f1524]">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Meeting chat</h2>
          <p className="text-xs text-gray-400">Persists during the call</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
        >
          Close
        </button>
      </header>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No messages yet. Say hello to the room.
          </p>
        ) : (
          messages.map((message) => {
            const isLocal = message.sender === localIdentity;
            return (
              <div key={message.id} className={isLocal ? "text-right" : "text-left"}>
                <p className="mb-1 text-xs text-gray-400">
                  {isLocal ? "You" : message.sender}
                </p>
                <div
                  className={`inline-block max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                    isLocal
                      ? "bg-corator-600 text-white"
                      : "bg-white/10 text-gray-100"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-white/10 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          const value = inputRef.current?.value ?? "";
          if (!value.trim()) return;
          onSend(value);
          if (inputRef.current) inputRef.current.value = "";
        }}
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none ring-corator-500 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-xl bg-corator-600 px-4 py-2 text-sm font-medium hover:bg-corator-500"
          >
            Send
          </button>
        </div>
      </form>
    </aside>
  );
}
