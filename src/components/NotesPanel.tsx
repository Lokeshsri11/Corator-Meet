"use client";

import type { NoteEntry } from "@/lib/types";

type NotesPanelProps = {
  notes: NoteEntry[];
  isListening: boolean;
  speechSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onAddNote: (text: string) => void;
  onExport: () => string;
  onClose: () => void;
};

export function NotesPanel({
  notes,
  isListening,
  speechSupported,
  onStartListening,
  onStopListening,
  onAddNote,
  onExport,
  onClose,
}: NotesPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-100">AI Notes</h2>
          <p className="text-[11px] text-gray-500">{notes.length} entries</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:bg-white/[0.06] hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <div className="flex gap-2 border-y border-white/[0.06] px-4 py-2.5">
        {speechSupported ? (
          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-colors ${
              isListening
                ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                : "bg-corator-600/15 text-corator-400 hover:bg-corator-600/25"
            }`}
          >
            {isListening && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            )}
            {isListening ? "Stop listening" : "Start AI Notes"}
          </button>
        ) : (
          <p className="text-[11px] text-gray-500">Speech recognition requires Chrome.</p>
        )}
        <button
          type="button"
          onClick={() => {
            const text = onExport();
            void navigator.clipboard.writeText(text);
          }}
          className="rounded-lg bg-white/[0.06] px-3 py-2 text-[11px] font-medium text-gray-400 hover:bg-white/10 hover:text-white"
          title="Copy all notes"
        >
          Copy
        </button>
      </div>

      <div className="scrollbar-thin flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
        {notes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-white/[0.03] p-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-gray-600">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p className="mt-3 text-sm text-gray-500">Notes appear from speech and chat</p>
            </div>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl bg-white/[0.03] px-3 py-2 text-[13px]"
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider ${
                    note.source === "speech"
                      ? "bg-corator-600/20 text-corator-400"
                      : note.source === "chat"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {note.source}
                </span>
                <span className="text-[10px] text-gray-600">
                  {new Date(note.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="leading-relaxed text-gray-300">{note.text}</p>
            </div>
          ))
        )}
      </div>

      <form
        className="border-t border-white/[0.06] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const input = (e.target as HTMLFormElement).elements.namedItem(
            "note",
          ) as HTMLInputElement;
          onAddNote(input.value);
          input.value = "";
        }}
      >
        <div className="flex gap-2">
          <input
            name="note"
            type="text"
            placeholder="Add a note..."
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-600 focus:border-corator-600/50 focus:ring-1 focus:ring-corator-600/30"
          />
          <button
            type="submit"
            className="rounded-xl bg-corator-600/15 px-3 py-2 text-xs font-medium text-corator-400 hover:bg-corator-600/25"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
