"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoomId, slugifyRoomName } from "@/lib/livekit";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Corator Meet";

  function goToRoom(roomName: string, asHost = false) {
    const slug = slugifyRoomName(roomName);
    if (!slug) return;
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    if (asHost) params.set("host", "1");
    const qs = params.toString();
    router.push(`/room/${slug}${qs ? `?${qs}` : ""}`);
  }

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-corator-600/[0.07] blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-corator-600 text-sm font-bold text-white">
              CM
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-corator-400">
                SorsCo
              </p>
              <h1 className="text-lg font-semibold text-gray-100">{appName}</h1>
            </div>
          </div>
          <span className="hidden rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] text-gray-500 sm:block">
            Self-hosted infrastructure
          </span>
        </header>

        {/* Hero */}
        <section className="my-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="max-w-xl text-4xl font-bold leading-[1.15] tracking-tight text-white md:text-5xl">
              Video meetings built for{" "}
              <span className="bg-gradient-to-r from-corator-400 to-corator-600 bg-clip-text text-transparent">
                real networks
              </span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-400">
              Adaptive streaming, resilient audio, and real-time collaboration tools
              — designed for low-bandwidth connections.
            </p>

            <ul className="mt-8 space-y-3.5">
              {[
                "Simulcast + dynacast for low-network video",
                "Opus FEC/RED for resilient audio",
                "Screen sharing with live pen annotations",
                "In-meeting chat, emoji reactions, AI notes",
                "Keyboard shortcuts (M, V, H, C, D)",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-corator-500">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Join Card */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#161b22] p-6 shadow-2xl shadow-black/20">
            <h3 className="text-lg font-semibold text-gray-100">Join or create a meeting</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              Enter your name and a room code, or create a new room.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                goToRoom(room);
              }}
            >
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-400">Your name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Rahul"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-corator-600/50 focus:ring-1 focus:ring-corator-600/30"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-400">Room code</span>
                <input
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                  placeholder="e.g. team-standup"
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-corator-600/50 focus:ring-1 focus:ring-corator-600/30"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-corator-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-corator-500"
              >
                Join meeting
              </button>
            </form>

            <div className="relative my-4 flex items-center">
              <div className="flex-1 border-t border-white/[0.06]" />
              <span className="px-3 text-[11px] text-gray-600">or</span>
              <div className="flex-1 border-t border-white/[0.06]" />
            </div>

            <button
              type="button"
              onClick={() => goToRoom(generateRoomId(), true)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06]"
            >
              Create new room
            </button>
          </div>
        </section>

        <footer className="text-center text-[11px] text-gray-600">
          Self-hosted Corator Meet · Powered by LiveKit
        </footer>
      </div>
    </main>
  );
}
