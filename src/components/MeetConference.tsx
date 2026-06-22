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
import { useChat } from "@/hooks/useChat";
import { useRoomSignals } from "@/hooks/useRoomSignals";
import { useAINotes } from "@/hooks/useAINotes";

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

  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [penActive, setPenActive] = useState(false);
  const [penColor, setPenColor] = useState("#3386fc");
  const [hasScreenShare, setHasScreenShare] = useState(false);

  const onScreenShareChange = useCallback((active: boolean) => {
    setHasScreenShare(active);
    if (!active) setPenActive(false);
  }, []);

  function togglePanel(panel: SidePanel) {
    setSidePanel((current) => (current === panel ? null : panel));
    if (panel === "chat" && !chatOpen) toggleChat();
  }

  return (
    <div className="meet-shell flex h-dvh flex-col overflow-hidden bg-[#070b14]">
      <header className="z-40 flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0c1220]/95 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-corator-600/20 text-sm font-bold text-corator-400">
            CM
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-corator-300">
              Corator Meet
            </p>
            <h1 className="text-base font-semibold sm:text-lg">{roomName}</h1>
          </div>
          {isHost && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
              Host
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CopyRoomLink roomName={roomName} />
          <button
            type="button"
            onClick={onLeave}
            className="rounded-full bg-red-500/90 px-3 py-1.5 text-sm font-medium hover:bg-red-500 lg:hidden"
          >
            Leave
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden pb-[var(--meet-bar-height)]">
        <div className="relative min-h-0 min-w-0 flex-1">
          <ConferenceLayout
            floatingEmojis={signals.floatingEmojis}
            strokes={signals.strokes}
            penActive={penActive}
            penColor={penColor}
            onStroke={signals.sendStroke}
            raisedHands={signals.raisedHands}
            onScreenShareChange={onScreenShareChange}
          />
        </div>

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
        onTogglePen={() => setPenActive((v) => !v)}
        onPenColorChange={setPenColor}
        onClearDrawing={signals.clearDrawing}
      />

      <ConnectionStateToast />
    </div>
  );
}
