export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantIdentity?: string;
  participantToken: string;
  deploymentMode?: "self-hosted" | "cloud";
  isHost?: boolean;
};

export type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
};

export type NoteEntry = {
  id: string;
  text: string;
  timestamp: number;
  source: "speech" | "chat" | "manual";
};

export type RoomSettings = {
  audio: boolean;
  video: boolean;
};
