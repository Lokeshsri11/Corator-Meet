"use client";

import { useCallback, useEffect, useState } from "react";
import { Room, RoomEvent, DataPacket_Kind } from "livekit-client";
import type { ChatMessage } from "@/lib/types";

const CHAT_TOPIC = "corator-chat";

type ChatPayload = {
  text: string;
  sender: string;
  timestamp: number;
};

export function useChat(room: Room | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!room) return;

    const onData = (
      payload: Uint8Array,
      participant?: { identity?: string },
      _kind?: DataPacket_Kind,
      topic?: string,
    ) => {
      if (topic !== CHAT_TOPIC) return;

      try {
        const decoded = JSON.parse(new TextDecoder().decode(payload)) as ChatPayload;
        const message: ChatMessage = {
          id: `${decoded.timestamp}-${decoded.sender}`,
          sender: decoded.sender,
          text: decoded.text,
          timestamp: decoded.timestamp,
        };

        setMessages((prev) => [...prev, message]);

        if (!isOpen && participant?.identity !== room.localParticipant.identity) {
          setUnread((count) => count + 1);
        }
      } catch {
        // ignore malformed messages
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room, isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!room || !text.trim()) return;

      const payload: ChatPayload = {
        text: text.trim(),
        sender: room.localParticipant.identity,
        timestamp: Date.now(),
      };

      const encoded = new TextEncoder().encode(JSON.stringify(payload));
      await room.localParticipant.publishData(encoded, {
        reliable: true,
        topic: CHAT_TOPIC,
      });

      const message: ChatMessage = {
        id: `${payload.timestamp}-${payload.sender}`,
        sender: payload.sender,
        text: payload.text,
        timestamp: payload.timestamp,
      };

      setMessages((prev) => [...prev, message]);
    },
    [room],
  );

  const toggleChat = useCallback(() => {
    setIsOpen((open) => {
      if (!open) setUnread(0);
      return !open;
    });
  }, []);

  return { messages, sendMessage, isOpen, toggleChat, unread };
}
