import { RoomOptions, ScreenSharePresets, VideoPresets } from "livekit-client";

export function getLiveKitRoomOptions(): RoomOptions {
  return {
    adaptiveStream: true,
    dynacast: true,
    videoCaptureDefaults: {
      resolution: VideoPresets.h720.resolution,
    },
    publishDefaults: {
      simulcast: true,
      videoSimulcastLayers: [
        VideoPresets.h180,
        VideoPresets.h360,
        VideoPresets.h720,
      ],
      screenShareEncoding: ScreenSharePresets.h1080fps30.encoding,
      screenShareSimulcastLayers: [
        ScreenSharePresets.h720fps15,
        ScreenSharePresets.h1080fps30,
      ],
      dtx: true,
      red: true,
    },
  };
}

export function generateRoomId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function slugifyRoomName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
