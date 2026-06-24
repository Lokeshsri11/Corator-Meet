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
  | { type: "draw-live"; id: string; points: DrawPoint[]; color: string; width: number; sender: string }
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

export function catmullRomToBezier(points: DrawPoint[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[Math.min(points.length - 1, i + 1)];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}
