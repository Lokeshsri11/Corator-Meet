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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1d3a6b,transparent_45%),#0b0f19]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-corator-300">
              SorsCo
            </p>
            <h1 className="text-2xl font-semibold">{appName}</h1>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
            Self-hosted · SorsCo infrastructure
          </span>
        </header>

        <section className="my-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
              Video meetings that work on real networks.
            </h2>
            <p className="mt-4 max-w-xl text-lg text-gray-300">
              Adaptive streaming, resilient audio, and in-meeting chat — built
              for low-bandwidth connections and persistent collaboration.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-corator-400" />
                Your media server on your VPS — no SaaS dependency
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-corator-400" />
                Simulcast + dynacast for low-network video
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-corator-400" />
                Opus FEC/RED for resilient audio
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-corator-400" />
                Real-time chat during calls
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-xl font-semibold">Join or create a meeting</h3>
            <p className="mt-2 text-sm text-gray-400">
              Enter your name and a room code. Share the room link with others.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                goToRoom(room);
              }}
            >
              <label className="block">
                <span className="mb-2 block text-sm text-gray-300">Your name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Rahul"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-corator-500 focus:ring-2"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-gray-300">Room code</span>
                <input
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                  placeholder="e.g. team-standup"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-corator-500 focus:ring-2"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-corator-600 py-3 font-medium hover:bg-corator-500"
              >
                Join meeting
              </button>
            </form>

            <button
              type="button"
              onClick={() => goToRoom(generateRoomId(), true)}
              className="mt-3 w-full rounded-xl border border-white/10 py-3 text-sm text-gray-200 hover:bg-white/5"
            >
              Create new room
            </button>
          </div>
        </section>

        <footer className="text-center text-xs text-gray-500">
          Self-hosted Corator Meet · Frontend on Dokploy · Media on your VPS
        </footer>
      </div>
    </main>
  );
}
