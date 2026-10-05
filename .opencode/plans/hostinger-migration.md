# Plan: Hostinger KVM 2 Migration (Railway + Vercel → single VPS)

## Goal
Abhi: Railway (backend) + Vercel (2 SPAs) + Railway env Mongo + Firebase OTP.
Naye: **1 Hostinger KVM 2 VPS** = Nginx (2 SPA) + PM2 (Express) + MongoDB (localhost) + Certbot SSL. **Firebase waise hi rahega** (sirf env values).

## Confirmed inputs (user se)
- **Prod DB**: Railway dashboard wala `MONGO_URI`
- **Code deploy**: GitHub se `git pull`
- **DNS**: Hostinger pe hai par **different Hostinger account** (alag login)

## Target architecture
```
DNS (Hostinger account #2):
  user.gaontitheudyojak.com  → A → <VPS_IP>
  admin.gaontitheudyojak.com → A → <VPS_IP>

VPS (Ubuntu 24.04, KVM 2):
  Nginx :80/:443
    user site  → /var/www/user  (SPA)  + /api → proxy 127.0.0.1:5000
    admin site → /var/www/admin (SPA)  + /api → proxy 127.0.0.1:5000
  PM2   gav-api → backend/server.js (PORT 5000)
  Mongo localhost:27017 (auth ON, db gav_tithe_db) — sab data GridFS me ✓
  Certbot auto-renew SSL
```
**Key trick**: frontends build with `VITE_API_BASE=/api` → same-origin → CORS ka issue hi nahi.

---

## Phase 0 — Purchase (15 min)
1. Hostinger → **KVM 2**, 24-mo term ($8.99/mo intro)
2. OS template: **Ubuntu 24.04 LTS**
3. Region: users ke nearest (Asia option ho toh)
4. hPanel → set **root password**; note **IPv4**

## Phase 1 — Server base setup (SSH, ~30-40 min)
```bash
adduser deploy && usermod -aG sudo deploy
ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable
apt update && apt upgrade -y
```
1. **Node 20 LTS**: NodeSource script → `apt install nodejs` → `npm i -g pm2`
2. **Nginx**: `apt install nginx -y`
3. **MongoDB 8.0** (official mongodb-org repo for Ubuntu):
   - bind `127.0.0.1` (bahar se closed)
   - pehle `localhost` auth off pe start → admin user banao → `security.authorization: enabled` → restart
   - `systemctl enable mongod`
4. **Certbot**: `apt install certbot python3-certbot-nginx`

## Phase 2 — Data migration (~30 min)
1. Railway dashboard se `MONGO_URI` copy
2. **VPS pe hi** dump (ek hi machine, simple):
```bash
mongodump --uri="<RAILWAY_MONGO_URI>" --archive=gav_prod.gz --gzip
mongorestore --uri="mongodb://127.0.0.1:27017" --archive=gav_prod.gz --gzip \
  --nsInclude='prodDbName.*' --nsFrom='prodDbName.*' --nsTo='gav_tithe_db.*'
```
   - Agar prod DB naam `gav_tithe_db` hai toh ns flags ki zaroorat nahi
3. Verify counts: `mongosh` → `db.users.countDocuments()` etc. (users, formdatas, drpentries + `uploads.files`)
4. **Pre-migration safety dump** Railway ka ek aur copy locally rakho (rollback ke liye)

## Phase 3 — Backend deploy (~30 min)
```bash
sudo mkdir -p /var/www/gav && sudo chown deploy /var/www/gav
git clone <github-repo-url> /var/www/gav/repo
cd /var/www/gav/repo/backend
npm ci --omit=dev
```
1. `.env` banao (sari values **Railway dashboard se copy**):
   - `PORT=5000`
   - `MONGO_URI=mongodb://<user>:<pass>@127.0.0.1:27017/gav_tithe_db?authSource=gav_tithe_db`
   - `JWT_SECRET`, `JWT_EXPIRES_IN`
   - `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY` (single-line `\n` — code already handles), `FIREBASE_CLIENT_EMAIL`, `FIREBASE_WEB_API_KEY`
2. PM2:
```bash
pm2 start server.js --name gav-api
pm2 save && pm2 startup systemd   # (print hue command ko run karo)
```
3. Test: `curl http://127.0.0.1:5000/` → `{"message":"Gav Tithe API running"}`

## Phase 4 — Frontends + Nginx (~45 min)
1. **Local pe build** (VPS pe bhi ho sakta hai,8GB hai):
   - `frontend-user/.env.production`:
     - `VITE_API_BASE=/api`
     - `VITE_FIREBASE_*` = 6 values (Vercel dashboard se copy — Vercel → Settings → Environment)
   - `npm run build` → `dist/`
   - upload: `rsync -avz dist/ deploy@VPS:/var/www/user/`
   - `frontend-admin`: sirf `VITE_API_BASE=/api` (admin me Firebase use nahi hota) → build → `/var/www/admin/`
2. **Nginx** (user site):
```nginx
server {
  listen 80; server_name user.gaontitheudyojak.com;
  root /var/www/user; index index.html;
  client_max_body_size 50m;          # KYC uploads ke liye zaroori
  location / { try_files $uri /index.html; }
  location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
   - Admin ke liye same block (server_name admin…, root /var/www/admin)
   - `/etc/nginx/sites-enabled/` me dono, `nginx -t && systemctl reload nginx`
3. **SSL**: `certbot --nginx -d user.gaontitheudyojak.com -d admin.gaontitheudyojak.com`
4. HTTP pe pehle test karo (Hostinger DNS set hone se pehle `/etc/hosts` me IP+domain daal ke bhi test ho jayega)

## Phase 5 — DNS cutover (5 min + propagation)
1. **Hostinger account #2** → Domain → DNS zone:
   - purane Vercel ke records (CNAME/A) hatao
   - `user` A → VPS_IP, `admin` A → VPS_IP (TTL 300 rakho)
2. Live test checklist:
   - [ ] Dono subdomains pe site + SSL
   - [ ] `curl https://user.../api/` → JSON health
   - [ ] **OTP login** (Firebase env sahi hai?)
   - [ ] Form submit + KYC upload (GridFS) + doc view
   - [ ] Admin login + Reports + PDF download
   - [ ] `pm2 reboot` test: server restart khud

## Phase 6 — Small code tweaks (repo me, execute phase me)
1. `frontend-user/src/services/api.js` **aur** `frontend-admin/src/services/api.js`:
   - fallback `https://gav-tithe-production.up.railway.app/api` → `"/api"` (env missing ho toh bhi sahi chale)
2. `backend/server.js` `allowedOrigins` se Railway origin hata do (cleanup, optional)
3. `frontend-user/vercel.json` — Vercel band hoga, kuch nahi karna
4. (Optional, baad me) GitHub Actions auto-deploy

## Phase 7 — After cutover
1. **Ek hafta** Railway + Vercel **mat cancel** (rollback = DNS wapas, 5 min)
2. **DB backup cron** (VPS pe):
   - daily `mongodump --archive=/var/backups/gav_$(date +%F).gz --gzip` + 7-day retention
3. **UptimeRobot** free account → 5-min ping user + admin + api
4. `pm2 install pm2-logrotate` (logs disk na khaye)
5. Railway/Vercel cancel → monthly bachat

## Rollback
- DNS records wapas Vercel pe daalo → site 5 min me live (old stack chalu hai)
- DB ki galti ho toh Phase 2 ka safety dump Railway/Atlas pe restore

## Risks/notes
- DNS account #2 me hai → VPS account se alag login (yaad rakhna)
- Firebase: **project wahi** — sirf `VITE_FIREBASE_*` build-time env me chahiye (Vercel me the, wahan se copy)
- Mongo auth + bind localhost = VPS firewall ke bahar DB safe
- `client_max_body_size 50m` na bhule (Nginx default1MB = KYC upload fail)
- GridFS = file data DB dump ke saath automatic ✓ (alag uploads folder nahi)

## Effort
- Phase 1-3: ~2-3 ghante, Phase 4-5: ~1-2 ghante + DNS propagation
- Sab commands ready — execution me sirf values (Railway URI, GitHub URL, Firebase env) chahiye
