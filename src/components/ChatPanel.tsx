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
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-100">Chat</h2>
          <p className="text-[11px] text-gray-500">{messages.length} messages</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-white/[0.06] hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <div className="scrollbar-thin flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-white/[0.03] p-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-gray-600">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p className="mt-3 text-sm text-gray-500">No messages yet</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isLocal = message.sender === localIdentity;
            return (
              <div key={message.id} className={`flex ${isLocal ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${isLocal ? "items-end" : "items-start"}`}>
                  <p className={`mb-0.5 text-[10px] text-gray-500 ${isLocal ? "text-right" : ""}`}>
                    {isLocal ? "You" : message.sender}
                    <span className="ml-1.5 text-gray-600">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </p>
                  <div
                    className={`inline-block rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                      isLocal
                        ? "rounded-tr-md bg-corator-600 text-white"
                        : "rounded-tl-md bg-white/[0.06] text-gray-200"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-white/[0.06] p-3"
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
            placeholder="Send a message..."
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-600 focus:border-corator-600/50 focus:ring-1 focus:ring-corator-600/30"
          />
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-corator-600 text-white hover:bg-corator-500"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
