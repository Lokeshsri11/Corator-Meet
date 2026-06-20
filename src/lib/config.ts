export type DeploymentMode = "self-hosted" | "cloud";

export type MediaServerConfig = {
  mode: DeploymentMode;
  serverUrl: string;
  apiKey: string;
  apiSecret: string;
  appName: string;
};

function getDeploymentMode(): DeploymentMode {
  const mode = process.env.DEPLOYMENT_MODE?.toLowerCase();
  if (mode === "cloud") return "cloud";
  return "self-hosted";
}

export function getMediaServerConfig(): MediaServerConfig | null {
  const apiKey = process.env.LIVEKIT_API_KEY?.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
  const serverUrl = (
    process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL
  )?.trim();

  if (!apiKey || !apiSecret || !serverUrl) {
    return null;
  }

  return {
    mode: getDeploymentMode(),
    serverUrl,
    apiKey,
    apiSecret,
    appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() ?? "Corator Meet",
  };
}

export function sanitizeParticipantIdentity(name: string): string {
  const trimmed = name.trim().slice(0, 64);
  const slug = trimmed.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_@.-]/g, "");
  return slug || "guest";
}

export function isLocalMediaServer(url: string): boolean {
  return (
    url.includes("127.0.0.1") ||
    url.includes("localhost") ||
    url.startsWith("ws://")
  );
}
