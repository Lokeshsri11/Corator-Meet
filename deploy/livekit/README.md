# Corator Meet — self-hosted stack (production on Uthu VPS)

## 1. Provision VPS

Create a separate Ubuntu VPS (not your Dokploy box). Open firewall:

| Protocol | Ports |
|----------|-------|
| TCP | 443, 7881 |
| UDP | 50000–50200, 3478 |

## 2. DNS

Point A-records to the VPS IP:

- `meet-sfu.sorsco.in`
- `meet-turn.sorsco.in`

## 3. Generate LiveKit config

```bash
ssh user@your-vps
mkdir ~/livekit && cd ~/livekit
docker run --rm -it -v $PWD:/output livekit/generate
```

When prompted:

| Prompt | Value |
|--------|-------|
| LiveKit domain | `meet-sfu.sorsco.in` |
| TURN domain | `meet-turn.sorsco.in` |
| External IP | yes |

Save the **API key** and **secret** from the output.

## 4. Tune livekit.yaml

Confirm in the generated file:

```yaml
port_range_start: 50000
port_range_end: 50200
use_external_ip: true
```

Copy `docker-compose.yml` from this folder to the VPS, then:

```bash
docker compose up -d
docker compose logs -f livekit
```

## 5. Wire Corator Meet app

Set on Dokploy (or `.env.local`):

```env
DEPLOYMENT_MODE=self-hosted
LIVEKIT_URL=wss://meet-sfu.sorsco.in
LIVEKIT_API_KEY=<from generate>
LIVEKIT_API_SECRET=<from generate>
NEXT_PUBLIC_LIVEKIT_URL=wss://meet-sfu.sorsco.in
```

## 6. Test

Join from two devices. In LiveKit logs you should see participants connect without `401 invalid token`.
