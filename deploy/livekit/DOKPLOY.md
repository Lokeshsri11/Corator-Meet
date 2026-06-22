# Self-host LiveKit on the same server as Dokploy

Your Meet app stays on Dokploy. LiveKit runs as a **second Docker stack** on the same machine.

**Server IP (from your sslip URL):** `187.127.140.161`

---

## Before you start

You need:

- [ ] SSH access to the Dokploy server
- [ ] Utho/hosting **firewall** panel open
- [ ] Corator Meet already working on Dokploy (done)

---

## Step 1 — Open firewall ports (Utho panel)

In your VPS firewall / security group, allow:

| Protocol | Ports | Why |
|----------|-------|-----|
| TCP | 443 | HTTPS + WebSocket (Traefik) |
| TCP | 7881 | LiveKit RTC TCP |
| UDP | 50000–50200 | Video/audio media |
| UDP | 3478 | TURN |

Port **443** is already used by Dokploy Traefik — that is OK. We route LiveKit through Traefik (no second Caddy on 443).

---

## Step 2 — SSH into the server

```bash
ssh root@187.127.140.161
```

(Use your real user/IP if different.)

---

## Step 3 — System tuning (one time)

```bash
sudo sysctl -w vm.overcommit_memory=1
sudo sysctl -w net.core.rmem_max=16777216
sudo sysctl -w net.core.wmem_max=16777216

echo "vm.overcommit_memory=1" | sudo tee -a /etc/sysctl.conf
echo "net.core.rmem_max=16777216" | sudo tee -a /etc/sysctl.conf
echo "net.core.wmem_max=16777216" | sudo tee -a /etc/sysctl.conf
```

---

## Step 4 — Generate LiveKit config

```bash
mkdir -p ~/livekit && cd ~/livekit
docker run --rm -it -v $PWD:/output livekit/generate
```

Answer the prompts:

| Prompt | Your answer |
|--------|-------------|
| LiveKit domain | `sfu.187-127-140-161.sslip.io` |
| TURN domain | `turn.187-127-140-161.sslip.io` |
| Use external IP | **yes** |

**Write down the API key and secret** from the output.

---

## Step 5 — Fix port 443 conflict (important)

`livekit/generate` creates a **Caddy** container on port 443. Dokploy **already uses 443** for Traefik.

Edit the generated compose file:

```bash
cd ~/livekit
nano docker-compose.yaml
```

**Remove or comment out the entire `caddy` service** and its volumes if present.

Your stack should keep at least:

- `livekit`
- `redis`

Save and exit.

---

## Step 6 — Tune livekit.yaml

```bash
nano livekit.yaml
```

Confirm:

```yaml
rtc:
  port_range_start: 50000
  port_range_end: 50200
  use_external_ip: true
```

Save.

---

## Step 7 — Start LiveKit (no Caddy)

```bash
cd ~/livekit
docker compose up -d
docker compose logs -f livekit
```

Wait until you see LiveKit started with no errors. Press `Ctrl+C` to leave logs.

Check containers:

```bash
docker compose ps
```

---

## Step 8 — Route HTTPS via Dokploy Traefik

LiveKit signal uses WebSocket on port **7880** inside Docker. Traefik must expose it at:

`https://sfu.187-127-140-161.sslip.io`

### Option A — Dokploy UI (easiest)

1. Dokploy → **Projects** → create project **livekit** (or use existing)
2. **Add Compose** → source: upload / paste your `~/livekit/docker-compose.yaml`
3. Deploy the stack
4. **Domains** tab on the LiveKit service:
   - Host: `sfu.187-127-140-161.sslip.io`
   - Container port: **7880**
   - Enable **Let's Encrypt**
5. Save and redeploy

### Option B — Connect LiveKit to Traefik network (manual)

If LiveKit runs via SSH compose only, attach Traefik labels by adding to `docker-compose.yaml` under the `livekit` service:

```yaml
labels:
  - traefik.enable=true
  - traefik.http.routers.corator-livekit.rule=Host(`sfu.187-127-140-161.sslip.io`)
  - traefik.http.routers.corator-livekit.entrypoints=websecure
  - traefik.http.routers.corator-livekit.tls=true
  - traefik.http.routers.corator-livekit.tls.certresolver=letsencrypt
  - traefik.http.services.corator-livekit.loadbalancer.server.port=7880
networks:
  - default
  - dokploy-network
```

Network name may differ — on the server run:

```bash
docker network ls | grep -i dokploy
```

Use the Traefik/Dokploy network name, then:

```bash
docker compose up -d
```

---

## Step 9 — Update Corator Meet env on Dokploy

Dokploy → **Sorsco-Meet** → **sorscomeet-app** → **Environment**

Replace with values from **Step 4** (your new self-hosted keys, not LiveKit Cloud):

```env
DEPLOYMENT_MODE=self-hosted
LIVEKIT_URL=wss://sfu.187-127-140-161.sslip.io
LIVEKIT_API_KEY=<your key from generate>
LIVEKIT_API_SECRET=<your secret from generate>
NEXT_PUBLIC_LIVEKIT_URL=wss://sfu.187-127-140-161.sslip.io
NEXT_PUBLIC_APP_NAME=Corator Meet
```

**Save → Deploy** (full redeploy).

---

## Step 10 — Test

1. Open your Meet app: `https://sorscomeet-app-...sslip.io`
2. Create a room
3. Join from phone or second browser
4. DevTools → Network:
   - `token` → **200**
   - `validate` → **200** (not 401, not failed)
5. Video + chat should work

Quick server test:

```bash
curl -I https://sfu.187-127-140-161.sslip.io
```

Should not be `connection refused`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `invalid token` | API key/secret must be from **your** `livekit.yaml` generate, not LiveKit Cloud |
| `ERR_NAME_NOT_RESOLVED` | Wait for sslip DNS or typo in domain |
| `Failed to fetch` on validate | Traefik not routing to 7880 — redo Step 8 |
| Caddy won't start / 443 in use | Remove Caddy service (Step 5) |
| One-way video / no media | Open UDP **50000–50200** in Utho firewall |
| Works on WiFi, not mobile | Open UDP **3478** (TURN) |

---

## Cost after this

| Item | Cost |
|------|------|
| LiveKit software | **Free** (open source) |
| LiveKit Cloud | **$0** (not used) |
| Extra server | **$0** (same Dokploy box) |
| VPS (Utho) | What you already pay |

---

## Architecture

```
https://sorscomeet-...sslip.io  →  Dokploy → Corator Meet (Next.js)
wss://sfu....sslip.io           →  Traefik → LiveKit :7880
UDP 50000-50200                 →  LiveKit (direct, not through Traefik)
```

---

## When you get sorsco.in domain later

1. DNS: `meet-sfu.sorsco.in` → same IP
2. Re-run `livekit/generate` with new domains OR update certs in Traefik
3. Change Dokploy env URLs to `wss://meet-sfu.sorsco.in`
4. Redeploy Meet app

No code changes needed.
