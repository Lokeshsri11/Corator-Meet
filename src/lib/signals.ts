export const SIGNAL_TOPIC = "corator-signals";

export type DrawPoint = { x: number; y: number };

export type DrawStroke = {
  id: string;
  points: DrawPoint[];
  color: string;
  width: number;
};

export type SignalMessage =
  | { type: "emoji"; emoji: string; sender: string; timestamp: number }
  | { type: "raise-hand"; raised: boolean; sender: string; name: string }
  | { type: "draw"; stroke: DrawStroke; sender: string }
  | { type: "clear-drawing"; sender: string };

export const REACTION_EMOJIS = ["👍", "👏", "❤️", "😂", "🎉", "🤔", "👋", "🔥"] as const;

export function encodeSignal(message: SignalMessage): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(message));
}

export function decodeSignal(payload: Uint8Array): SignalMessage | null {
  try {
    return JSON.parse(new TextDecoder().decode(payload)) as SignalMessage;
  } catch {
    return null;
  }
}
