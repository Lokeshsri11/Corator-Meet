import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  getMediaServerConfig,
  sanitizeParticipantIdentity,
} from "@/lib/config";

export const revalidate = 0;

export async function POST(request: NextRequest) {
  const config = getMediaServerConfig();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "Media server is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.",
      },
      { status: 500 },
    );
  }

  let body: { roomName?: string; participantName?: string; isHost?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const roomName = body.roomName?.trim();
  const displayName = body.participantName?.trim();
  const isHost = Boolean(body.isHost);

  if (!roomName || !displayName) {
    return NextResponse.json(
      { error: "roomName and participantName are required" },
      { status: 400 },
    );
  }

  const identity = sanitizeParticipantIdentity(displayName);

  const token = new AccessToken(config.apiKey, config.apiSecret, {
    identity,
    name: displayName,
    ttl: "2h",
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isHost,
  });

  const participantToken = await token.toJwt();

  return NextResponse.json({
    serverUrl: config.serverUrl,
    roomName,
    participantName: displayName,
    participantIdentity: identity,
    participantToken,
    deploymentMode: config.mode,
    isHost,
  });
}
