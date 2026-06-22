import { RoomServiceClient } from "livekit-server-sdk";
import { TrackSource } from "@livekit/protocol";
import { NextRequest, NextResponse } from "next/server";
import { getMediaServerConfig } from "@/lib/config";

export const revalidate = 0;

export async function POST(request: NextRequest) {
  const config = getMediaServerConfig();
  if (!config) {
    return NextResponse.json({ error: "Media server not configured" }, { status: 500 });
  }

  let body: {
    roomName?: string;
    participantIdentity?: string;
    muted?: boolean;
    isHost?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { roomName, participantIdentity, muted, isHost } = body;

  if (!roomName || !participantIdentity || typeof muted !== "boolean") {
    return NextResponse.json(
      { error: "roomName, participantIdentity, and muted are required" },
      { status: 400 },
    );
  }

  if (!isHost) {
    return NextResponse.json({ error: "Only the host can mute participants" }, { status: 403 });
  }

  const host = config.serverUrl
    .replace("wss://", "https://")
    .replace("ws://", "http://");

  const svc = new RoomServiceClient(host, config.apiKey, config.apiSecret);

  try {
    const participants = await svc.listParticipants(roomName);
    const target = participants.find((p) => p.identity === participantIdentity);

    if (!target) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const micTrack = target.tracks.find((t) => t.source === TrackSource.MICROPHONE);

    if (!micTrack?.sid) {
      return NextResponse.json({ error: "No microphone track found" }, { status: 404 });
    }

    await svc.mutePublishedTrack(roomName, participantIdentity, micTrack.sid, muted);

    return NextResponse.json({ success: true, muted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mute failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
