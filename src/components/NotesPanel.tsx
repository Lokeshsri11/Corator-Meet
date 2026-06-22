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
    <aside className="flex h-full w-80 flex-col border-l border-white/10 bg-[#0f1524]">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">AI Notes</h2>
          <p className="text-xs text-gray-400">Live transcript + chat capture</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-white/5"
        >
          Close
        </button>
      </header>

      <div className="flex gap-2 border-b border-white/10 p-3">
        {speechSupported ? (
          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            className={`flex-1 rounded-xl py-2 text-sm font-medium ${
              isListening
                ? "bg-red-500/90 hover:bg-red-500"
                : "bg-corator-600 hover:bg-corator-500"
            }`}
          >
            {isListening ? "Stop listening" : "Start AI notes"}
          </button>
        ) : (
          <p className="text-xs text-gray-500">Speech recognition not supported in this browser. Use Chrome.</p>
        )}
        <button
          type="button"
          onClick={() => {
            const text = onExport();
            void navigator.clipboard.writeText(text);
          }}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs hover:bg-white/5"
          title="Copy all notes"
        >
          Copy
        </button>
      </div>

      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
        {notes.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Notes appear here from speech and chat.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm"
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    note.source === "speech"
                      ? "bg-corator-600/30 text-corator-300"
                      : note.source === "chat"
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-gray-500/20 text-gray-300"
                  }`}
                >
                  {note.source}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(note.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-200">{note.text}</p>
            </div>
          ))
        )}
      </div>

      <form
        className="border-t border-white/10 p-3"
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
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none ring-corator-500 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-xl bg-corator-600 px-3 py-2 text-sm hover:bg-corator-500"
          >
            Add
          </button>
        </div>
      </form>
    </aside>
  );
}
