Khela Dekho — Deployment Session Memory

Date: July 17, 2026
Project: Khela Dekho Sports Blog (FastAPI + RAG)
Repo: https://github.com/Abir-Zayn/khela-dekho
Live URL: https://kheladekho.dev


What We Accomplished

Went from "what's a free VPS" to a fully hardened, SSL-secured, zero-downtime-deployable production API — all in one session.

1. AWS Account & Credits


Confirmed AWS Free Tier credit structure: $100 (Free Tier) + $20 (RDS/Aurora explore credit) = $120 total, credits valid until 06/12/2027
Free Plan account itself auto-closes 6 months from signup (~Dec 12, 2026) regardless of remaining credit
Chose Option A: local Postgres container (not RDS) for now — simpler, free, matches the deployment guide. RDS migration left as a future option since the $20 credit is still unused.


2. EC2 Instance Setup


Launched t3.micro, Ubuntu 24.04 LTS, in ap-south-1 (Mumbai)
Instance ID: i-07a2585e2e3ffe555, named fastapi-dev
Key pair: fastapi-dev-key.pem (stored in WSL at ~/.ssh/)
Set Credit specification to Standard (not Unlimited) to avoid surprise burst-billing
Allocated and associated an Elastic IP: 3.6.195.0 (permanent, survives instance stop/start)


3. Server Hardening


SSH key-only authentication (PasswordAuthentication no)
Root login disabled (PermitRootLogin no)
UFW firewall enabled (OpenSSH, then later Nginx Full)
fail2ban installed and running (auto-bans repeated failed login attempts)
Added 2GB swap file (safety net for 1GB RAM instance during Docker builds)
Security group inbound rules: SSH (22), HTTP (80), HTTPS (443) — all 0.0.0.0/0 (compensated by instance-level hardening above)


4. Domain & DNS


Registered kheladekho.dev for free via GitHub Student Developer Pack (name.com offer)
Added DNS A records:

kheladekho.dev → 3.6.195.0
api.kheladekho.dev → 3.6.195.0



Used name.com's built-in DNS (skipped Route 53 to avoid the ~$6/year hosted zone fee)


5. Nginx Reverse Proxy


Installed Nginx, configured reverse proxy at /etc/nginx/sites-available/kheladekho
Proxies kheladekho.dev / api.kheladekho.dev → 127.0.0.1:8000 (FastAPI container)
Removed default Nginx site to prevent it from intercepting requests


6. SSL/HTTPS


Installed Certbot (python3-certbot-nginx)
Issued Let's Encrypt certificate for kheladekho.dev and api.kheladekho.dev
Certificate expires 2026-10-15, auto-renewal confirmed working via certbot renew --dry-run
HTTP → HTTPS redirect confirmed (301 Moved Permanently)


7. Application Deployment (Docker)


Cloned repo onto EC2: ~/khela-dekho
Pulled Dockerfile and docker-compose.yml from GitHub (multi-stage build using uv, non-root user, Postgres 15-alpine service)
Created production .env on the server (never committed to git) with:

DATABASE_URL (async Postgres via asyncpg, pointing to the db container)
Freshly generated SECRET_KEY and DB_PASSWORD
AWS S3, Resend email, and other app-specific secrets copied from local dev .env



Built and ran containers: docker compose up --build -d
Debugged a first-boot race condition: all 4 Uvicorn workers tried to run CREATE TYPE user_role AS ENUM(...) simultaneously on a fresh DB, causing a UniqueViolationError in 3 of 4 workers. Self-healed on Uvicorn's automatic worker restart (harmless one-time occurrence on fresh databases; flagged as a future improvement to move schema creation to a proper migration step, e.g. Alembic).


8. Verified End-to-End


https://kheladekho.dev → returns live JSON from FastAPI
https://kheladekho.dev/docs → Swagger UI renders correctly
HTTP auto-redirects to HTTPS
Both web and db containers stable and running


9. Zero-Downtime Deployment Workflow (Phase 5)

Established and tested the update workflow for future code changes:

bashcd ~/khela-dekho
git pull origin main
cd backend
docker compose build web
docker compose up -d --no-deps web

Confirmed db container stays untouched (zero DB downtime) while web redeploys.


Key Credentials & Locations (for reference — do not share publicly)


SSH key: ~/.ssh/fastapi-dev-key.pem (WSL)
Server connect: ssh -i ~/.ssh/fastapi-dev-key.pem ubuntu@3.6.195.0
App directory on server: ~/khela-dekho/backend
.env location: ~/khela-dekho/backend/.env (server-only, gitignored)



Debugging Lessons Learned (useful for next time)


EC2 Instance Connect does NOT bypass the security group — it connects from AWS's own IP range, which still must be allowed inbound.
Always check which shell you're in before running SSH commands — typing ssh ubuntu@<ip> while already inside the instance tries to SSH from the server back to itself.
nano can silently lose content if commands get typed into the buffer accidentally (e.g., via copy-paste mishaps) — safer to use sudo tee ... << 'EOF' heredocs for writing config files non-interactively.
AWS security group edits can silently drop existing rules — always re-verify all expected rules (SSH, HTTP, HTTPS) exist after each edit.
curl -I (HEAD request) can return 405 on routes that only define GET — not a bug, just a method mismatch. Use plain curl (GET) to test properly.
Nginx server_name matching — testing via curl http://localhost or the bare IP won't match a config scoped to a specific domain; always test with the actual domain name.