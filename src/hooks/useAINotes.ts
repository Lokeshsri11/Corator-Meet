"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, NoteEntry } from "@/lib/types";

export function useAINotes(chatMessages: ChatMessage[]) {
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const seenChatRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setSpeechSupported(supported);
  }, []);

  useEffect(() => {
    for (const msg of chatMessages) {
      if (seenChatRef.current.has(msg.id)) continue;
      seenChatRef.current.add(msg.id);
      setNotes((prev) => [
        ...prev,
        {
          id: `chat-${msg.id}`,
          text: `${msg.sender}: ${msg.text}`,
          timestamp: msg.timestamp,
          source: "chat",
        },
      ]);
    }
  }, [chatMessages]);

  const startListening = useCallback(() => {
    if (!speechSupported || isListening) return;

    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }
      if (finalText.trim()) {
        setNotes((prev) => [
          ...prev,
          {
            id: `speech-${Date.now()}`,
            text: finalText.trim(),
            timestamp: Date.now(),
            source: "speech",
          },
        ]);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [speechSupported, isListening]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const addManualNote = useCallback((text: string) => {
    if (!text.trim()) return;
    setNotes((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        text: text.trim(),
        timestamp: Date.now(),
        source: "manual",
      },
    ]);
  }, []);

  const exportNotes = useCallback(() => {
    const lines = notes.map((n) => {
      const time = new Date(n.timestamp).toLocaleTimeString();
      return `[${time}] ${n.text}`;
    });
    return lines.join("\n");
  }, [notes]);

  return {
    notes,
    isListening,
    speechSupported,
    startListening,
    stopListening,
    addManualNote,
    exportNotes,
  };
}
