"use client";

import { useCallback, useEffect, useState } from "react";
import { Room, RoomEvent, DataPacket_Kind } from "livekit-client";
import {
  SIGNAL_TOPIC,
  decodeSignal,
  encodeSignal,
  type DrawStroke,
  type SignalMessage,
} from "@/lib/signals";

export type FloatingEmoji = {
  id: string;
  emoji: string;
  sender: string;
};

export function useRoomSignals(room: Room | undefined, localName: string) {
  const [raisedHands, setRaisedHands] = useState<Record<string, string>>({});
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [localHandRaised, setLocalHandRaised] = useState(false);

  const publish = useCallback(
    async (message: SignalMessage) => {
      if (!room) return;
      await room.localParticipant.publishData(encodeSignal(message), {
        reliable: message.type === "raise-hand" || message.type === "clear-drawing",
        topic: SIGNAL_TOPIC,
      });
    },
    [room],
  );

  useEffect(() => {
    if (!room) return;

    const onData = (
      payload: Uint8Array,
      _participant?: { identity?: string },
      _kind?: DataPacket_Kind,
      topic?: string,
    ) => {
      if (topic !== SIGNAL_TOPIC) return;
      const message = decodeSignal(payload);
      if (!message) return;

      switch (message.type) {
        case "emoji": {
          const id = `${message.timestamp}-${message.sender}`;
          setFloatingEmojis((prev) => [
            ...prev,
            { id, emoji: message.emoji, sender: message.sender },
          ]);
          setTimeout(() => {
            setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
          }, 3000);
          break;
        }
        case "raise-hand":
          setRaisedHands((prev) => {
            const next = { ...prev };
            if (message.raised) {
              next[message.sender] = message.name;
            } else {
              delete next[message.sender];
            }
            return next;
          });
          break;
        case "draw":
          setStrokes((prev) => [...prev, message.stroke]);
          break;
        case "clear-drawing":
          setStrokes([]);
          break;
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room]);

  const sendEmoji = useCallback(
    async (emoji: string) => {
      if (!room) return;
      const message: SignalMessage = {
        type: "emoji",
        emoji,
        sender: room.localParticipant.identity,
        timestamp: Date.now(),
      };
      await publish(message);
      const id = `${message.timestamp}-${message.sender}`;
      setFloatingEmojis((prev) => [...prev, { id, emoji, sender: message.sender }]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
      }, 3000);
    },
    [room, publish],
  );

  const toggleRaiseHand = useCallback(async () => {
    if (!room) return;
    const raised = !localHandRaised;
    setLocalHandRaised(raised);
    const message: SignalMessage = {
      type: "raise-hand",
      raised,
      sender: room.localParticipant.identity,
      name: localName,
    };
    await publish(message);
    setRaisedHands((prev) => {
      const next = { ...prev };
      if (raised) {
        next[room.localParticipant.identity] = localName;
      } else {
        delete next[room.localParticipant.identity];
      }
      return next;
    });
  }, [room, localHandRaised, localName, publish]);

  const sendStroke = useCallback(
    async (stroke: DrawStroke) => {
      if (!room) return;
      setStrokes((prev) => [...prev, stroke]);
      await publish({ type: "draw", stroke, sender: room.localParticipant.identity });
    },
    [room, publish],
  );

  const clearDrawing = useCallback(async () => {
    if (!room) return;
    setStrokes([]);
    await publish({ type: "clear-drawing", sender: room.localParticipant.identity });
  }, [room, publish]);

  return {
    raisedHands,
    floatingEmojis,
    strokes,
    localHandRaised,
    sendEmoji,
    toggleRaiseHand,
    sendStroke,
    clearDrawing,
  };
}
