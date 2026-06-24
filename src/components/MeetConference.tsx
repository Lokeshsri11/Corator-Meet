"use client";

import { useCallback, useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { ConnectionStateToast } from "@livekit/components-react";
import { ChatPanel } from "@/components/ChatPanel";
import { CopyRoomLink } from "@/components/CopyRoomLink";
import { ConferenceLayout } from "@/components/ConferenceLayout";
import { ConferenceControls } from "@/components/ConferenceControls";
import { NotesPanel } from "@/components/NotesPanel";
import { ParticipantsPanel } from "@/components/ParticipantsPanel";
import { ConnectionQualityBadge } from "@/components/ConnectionQuality";
import { useChat } from "@/hooks/useChat";
import { useRoomSignals } from "@/hooks/useRoomSignals";
import { useAINotes } from "@/hooks/useAINotes";
import { useMeetingTimer } from "@/hooks/useMeetingTimer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

type MeetConferenceProps = {
  participantName: string;
  roomName: string;
  isHost: boolean;
  onLeave: () => void;
};

type SidePanel = "chat" | "notes" | "people" | null;

export function MeetConference({
  participantName,
  roomName,
  isHost,
  onLeave,
}: MeetConferenceProps) {
  const room = useRoomContext();
  const { messages, sendMessage, isOpen: chatOpen, toggleChat, unread } = useChat(room);
  const signals = useRoomSignals(room, participantName);
  const aiNotes = useAINotes(messages);
  const timer = useMeetingTimer();

  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [penActive, setPenActive] = useState(false);
  const [penColor, setPenColor] = useState("#3386fc");
  const [hasScreenShare, setHasScreenShare] = useState(false);
  const [viewMode, setViewMode] = useState<"auto" | "grid" | "speaker">("auto");

  const onScreenShareChange = useCallback((active: boolean) => {
    setHasScreenShare(active);
    if (!active) setPenActive(false);
  }, []);

  function togglePanel(panel: SidePanel) {
    setSidePanel((current) => (current === panel ? null : panel));
    if (panel === "chat" && !chatOpen) toggleChat();
  }

  const togglePen = useCallback(() => setPenActive((v) => !v), []);

  useKeyboardShortcuts({
    room,
    onToggleChat: () => togglePanel("chat"),
    onToggleRaiseHand: signals.toggleRaiseHand,
    onTogglePen: togglePen,
    hasScreenShare,
  });

  return (
    <div className="meet-shell flex h-dvh flex-col overflow-hidden bg-[#0d1117]">
      {/* Header */}
      <header className="z-40 flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#161b22] px-4 py-2 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-corator-600 text-xs font-bold text-white">
            CM
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-gray-100 sm:text-base">{roomName}</h1>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] tabular-nums text-gray-500">{timer.formatted}</span>
              {isHost && (
                <span className="rounded bg-amber-500/15 px-1.5 py-px text-[10px] font-medium text-amber-400">
                  Host
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionQualityBadge />
          <CopyRoomLink roomName={roomName} />
        </div>
      </header>

      {/* Stage + Side panels */}
      <div className="flex min-h-0 flex-1 overflow-hidden pb-[var(--meet-bar-height)]">
        <div className="relative min-h-0 min-w-0 flex-1">
          <ConferenceLayout
            floatingEmojis={signals.floatingEmojis}
            strokes={signals.strokes}
            liveDraws={signals.liveDraws}
            penActive={penActive}
            penColor={penColor}
            onStroke={signals.sendStroke}
            onLivePoints={signals.sendLiveDrawPoints}
            raisedHands={signals.raisedHands}
            onScreenShareChange={onScreenShareChange}
            viewMode={viewMode}
          />
        </div>

        {sidePanel && (
          <div className="w-80 shrink-0 border-l border-white/[0.06] bg-[#161b22]">
            {sidePanel === "chat" && (
              <ChatPanel
                messages={messages}
                onSend={sendMessage}
                onClose={() => setSidePanel(null)}
                localIdentity={participantName}
              />
            )}
            {sidePanel === "notes" && (
              <NotesPanel
                notes={aiNotes.notes}
                isListening={aiNotes.isListening}
                speechSupported={aiNotes.speechSupported}
                onStartListening={aiNotes.startListening}
                onStopListening={aiNotes.stopListening}
                onAddNote={aiNotes.addManualNote}
                onExport={aiNotes.exportNotes}
                onClose={() => setSidePanel(null)}
              />
            )}
            {sidePanel === "people" && (
              <ParticipantsPanel
                isHost={isHost}
                roomName={roomName}
                raisedHands={signals.raisedHands}
                onClose={() => setSidePanel(null)}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <ConferenceControls
        onToggleChat={() => togglePanel("chat")}
        onToggleNotes={() => togglePanel("notes")}
        onTogglePeople={() => togglePanel("people")}
        onToggleRaiseHand={signals.toggleRaiseHand}
        onSendEmoji={signals.sendEmoji}
        handRaised={signals.localHandRaised}
        activePanel={sidePanel}
        chatUnread={unread}
        isHost={isHost}
        hasScreenShare={hasScreenShare}
        penActive={penActive}
        penColor={penColor}
        onTogglePen={togglePen}
        onPenColorChange={setPenColor}
        onClearDrawing={signals.clearDrawing}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <ConnectionStateToast />
    </div>
  );
}
