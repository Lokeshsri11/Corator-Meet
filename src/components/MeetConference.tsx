"use client";

import { useRoomContext } from "@livekit/components-react";
import { VideoConference } from "@livekit/components-react";
import { ChatPanel } from "@/components/ChatPanel";
import { CopyRoomLink } from "@/components/CopyRoomLink";
import { useChat } from "@/hooks/useChat";

type MeetConferenceProps = {
  participantName: string;
  roomName: string;
  onLeave: () => void;
};

export function MeetConference({
  participantName,
  roomName,
  onLeave,
}: MeetConferenceProps) {
  const room = useRoomContext();
  const { messages, sendMessage, isOpen, toggleChat, unread } = useChat(room);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-white/10 bg-[#0f1524]/90 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-corator-300">
            Corator Meet
          </p>
          <h1 className="text-lg font-semibold">{roomName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <CopyRoomLink roomName={roomName} />
          <button
            type="button"
            onClick={toggleChat}
            className="relative rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Chat
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-corator-500 px-1 text-xs">
                {unread}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="rounded-full bg-red-500/90 px-4 py-2 text-sm font-medium hover:bg-red-500"
          >
            Leave
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <VideoConference />
        </div>
        {isOpen && (
          <ChatPanel
            messages={messages}
            onSend={sendMessage}
            onClose={toggleChat}
            localIdentity={participantName}
          />
        )}
      </div>
    </div>
  );
}
