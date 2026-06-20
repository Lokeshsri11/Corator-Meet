"use client";

import { Suspense, use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocalUserChoices } from "@livekit/components-react";
import type { ConnectionDetails } from "@/lib/types";
import { PreJoinScreen } from "@/components/PreJoinScreen";
import { MeetRoom } from "@/components/MeetRoom";

type RoomPageProps = {
  params: Promise<{ roomName: string }>;
};

function RoomPageContent({ params }: RoomPageProps) {
  const { roomName } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultName = searchParams.get("name") ?? "";

  const [joined, setJoined] = useState(false);
  const [choices, setChoices] = useState<LocalUserChoices | null>(null);
  const [details, setDetails] = useState<ConnectionDetails | null>(null);

  if (joined && choices && details) {
    return (
      <MeetRoom
        choices={choices}
        details={details}
        onLeave={() => router.push("/")}
      />
    );
  }

  return (
    <PreJoinScreen
      roomName={roomName}
      onBack={() => router.push("/")}
      onJoin={(userChoices, connectionDetails) => {
        setChoices({
          ...userChoices,
          username: userChoices.username || defaultName,
        });
        setDetails(connectionDetails);
        setJoined(true);
      }}
    />
  );
}

export default function RoomPage({ params }: RoomPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] text-gray-400">
          Loading room...
        </div>
      }
    >
      <RoomPageContent params={params} />
    </Suspense>
  );
}
