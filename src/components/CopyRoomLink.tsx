"use client";

import { useCallback, useState } from "react";

type CopyRoomLinkProps = {
  roomName: string;
};

export function CopyRoomLink({ roomName }: CopyRoomLinkProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    const url = `${window.location.origin}/room/${roomName}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomName]);

  return (
    <button
      type="button"
      onClick={copyLink}
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
    >
      {copied ? "Copied!" : "Copy invite link"}
    </button>
  );
}
