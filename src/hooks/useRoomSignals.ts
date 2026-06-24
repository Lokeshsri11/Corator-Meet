"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, DataPacket_Kind } from "livekit-client";
import {
  SIGNAL_TOPIC,
  decodeSignal,
  encodeSignal,
  type DrawPoint,
  type DrawStroke,
  type SignalMessage,
} from "@/lib/signals";

export type FloatingEmoji = {
  id: string;
  emoji: string;
  sender: string;
};

export type LiveDraw = {
  id: string;
  points: DrawPoint[];
  color: string;
  width: number;
  sender: string;
};

export function useRoomSignals(room: Room | undefined, localName: string) {
  const [raisedHands, setRaisedHands] = useState<Record<string, string>>({});
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [liveDraws, setLiveDraws] = useState<LiveDraw[]>([]);
  const [localHandRaised, setLocalHandRaised] = useState(false);
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const publish = useCallback(
    async (message: SignalMessage, reliable = true) => {
      if (!room) return;
      await room.localParticipant.publishData(encodeSignal(message), {
        reliable,
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
          setLiveDraws((prev) => prev.filter((d) => d.id !== message.stroke.id));
          break;
        case "draw-live":
          setLiveDraws((prev) => {
            const idx = prev.findIndex((d) => d.id === message.id);
            const entry: LiveDraw = {
              id: message.id,
              points: message.points,
              color: message.color,
              width: message.width,
              sender: message.sender,
            };
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = entry;
              return next;
            }
            return [...prev, entry];
          });
          break;
        case "clear-drawing":
          setStrokes([]);
          setLiveDraws([]);
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

  const sendLiveDrawPoints = useCallback(
    (id: string, points: DrawPoint[], color: string, width: number) => {
      if (!room) return;
      if (throttleRef.current) return;

      throttleRef.current = setTimeout(() => {
        throttleRef.current = null;
      }, 40);

      publish(
        {
          type: "draw-live",
          id,
          points,
          color,
          width,
          sender: room.localParticipant.identity,
        },
        false,
      );
    },
    [room, publish],
  );

  const sendStroke = useCallback(
    async (stroke: DrawStroke) => {
      if (!room) return;
      setStrokes((prev) => [...prev, stroke]);
      setLiveDraws((prev) => prev.filter((d) => d.id !== stroke.id));
      await publish({ type: "draw", stroke, sender: room.localParticipant.identity }, true);
    },
    [room, publish],
  );

  const clearDrawing = useCallback(async () => {
    if (!room) return;
    setStrokes([]);
    setLiveDraws([]);
    await publish({ type: "clear-drawing", sender: room.localParticipant.identity }, true);
  }, [room, publish]);

  return {
    raisedHands,
    floatingEmojis,
    strokes,
    liveDraws,
    localHandRaised,
    sendEmoji,
    toggleRaiseHand,
    sendStroke,
    sendLiveDrawPoints,
    clearDrawing,
  };
}
