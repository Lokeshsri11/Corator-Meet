import { NextResponse } from "next/server";
import {
  getMediaServerConfig,
  isLocalMediaServer,
} from "@/lib/config";

export async function GET() {
  const config = getMediaServerConfig();

  return NextResponse.json({
    status: "ok",
    app: config?.appName ?? "Corator Meet",
    deploymentMode: config?.mode ?? "self-hosted",
    mediaServerConfigured: Boolean(config),
    mediaServerUrl: config?.serverUrl ?? null,
    mediaServerLocal: config ? isLocalMediaServer(config.serverUrl) : false,
  });
}
