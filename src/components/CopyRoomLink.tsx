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
      className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.08] hover:text-white"
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy link
        </>
      )}
    </button>
  );
}
