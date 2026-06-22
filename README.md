# Corator Meet

Self-hosted video meetings for SorsCo / Corator — your app, your VPS, no third-party SaaS.

## Stack (all yours)

| Layer | What | Where |
|-------|------|-------|
| Frontend | Next.js (this repo) | Dokploy |
| Token API | `/api/token` (move to Laravel later) | Dokploy |
| Media SFU | LiveKit open source | **Your Utho VPS** |
| TURN | coturn (via livekit/generate) | **Your Utho VPS** |

No LiveKit Cloud. No per-minute API fees. You own the infrastructure.

## Features

- Create or join rooms by code
- Pre-join camera/mic preview
- Group video calls (SFU on your server)
- Screen sharing
- In-meeting chat (data channels)
- Low-network tuning: simulcast, dynacast, adaptive stream, Opus FEC/RED

## Quick start (local)

### 1. Start the media server (Docker)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
npm run media:up
```

This runs LiveKit on `ws://127.0.0.1:7880` with dev keys from `deploy/livekit/livekit.dev.yaml`.

### 2. Configure env

```bash
cp .env.development.example .env.local
```

### 3. Run the app

```bash
npm install
npm run dev
```

Or one command: `npm run dev:full`

Open http://localhost:3000 and join from two tabs.

## Production (Utho VPS)

Full guide: **[deploy/livekit/README.md](deploy/livekit/README.md)**

**Same server as Dokploy:** **[deploy/livekit/DOKPLOY.md](deploy/livekit/DOKPLOY.md)** ← start here

Summary:

1. Create Ubuntu VPS (separate from Dokploy)
2. DNS: `meet-sfu.sorsco.in`, `meet-turn.sorsco.in`
3. Run `livekit/generate` on the VPS
4. `docker compose up -d` in `deploy/livekit/`
5. Set env on Dokploy:

```env
DEPLOYMENT_MODE=self-hosted
LIVEKIT_URL=wss://meet-sfu.sorsco.in
LIVEKIT_API_KEY=<from generate>
LIVEKIT_API_SECRET=<from generate>
NEXT_PUBLIC_LIVEKIT_URL=wss://meet-sfu.sorsco.in
NEXT_PUBLIC_APP_NAME=Corator Meet
```

6. Deploy app to Dokploy with HTTPS (`meet.sorsco.in`)

## Environment variables

| Variable | Description |
|----------|-------------|
| `DEPLOYMENT_MODE` | `self-hosted` (default) or `cloud` |
| `LIVEKIT_URL` | WebSocket URL to **your** media server |
| `LIVEKIT_API_KEY` | Key from your `livekit.yaml` |
| `LIVEKIT_API_SECRET` | Secret from your `livekit.yaml` |
| `NEXT_PUBLIC_LIVEKIT_URL` | Same as `LIVEKIT_URL` (browser) |
| `NEXT_PUBLIC_APP_NAME` | Display name |

## Architecture

```
Browser ──HTTPS──► Dokploy (Next.js + /api/token)
   │
   └── WebRTC ────► Your VPS (LiveKit SFU + TURN)
                    meet-sfu.sorsco.in
```

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run media:up` | Start local LiveKit (Docker) |
| `npm run media:down` | Stop local LiveKit |
| `npm run media:logs` | Tail LiveKit logs |
| `npm run dev:full` | Media server + dev server |

## Roadmap

- [x] Phase 1: Self-hosted video + in-meeting chat
- [ ] Phase 2: Persistent chat (Laravel Reverb)
- [ ] Phase 3: Laravel Identity + tenant tokens
- [ ] Phase 4: AI transcription + summaries

## Project structure

```
corator-meet/
├── deploy/livekit/       # VPS media server configs
├── docker-compose.dev.yml
├── src/
│   ├── app/api/token/    # Room JWT minting
│   ├── components/       # Meet UI
│   └── lib/config.ts     # Self-hosted config
└── Dockerfile            # Dokploy deploy
```
