export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantIdentity?: string;
  participantToken: string;
  deploymentMode?: "self-hosted" | "cloud";
};

export type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
};

export type RoomSettings = {
  audio: boolean;
  video: boolean;
};
