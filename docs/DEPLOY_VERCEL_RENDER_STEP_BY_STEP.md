# Step-by-step: Deploy VoteWise AI with GitHub + Render (API) + Vercel (SPA)

This guide assumes:

- Your code lives in a **GitHub** repository that contains this monorepo (`frontend/` and `backend/` at the top level).
- You deploy the **Express API** on **Render** and the **Vite React app** on **Vercel**.
- You use **MongoDB Atlas** for production data (recommended).

---

## Part A — Prepare accounts and local repo

### A1. Create accounts

1. **GitHub** — [github.com](https://github.com)  
2. **MongoDB Atlas** — [mongodb.com/atlas](https://www.mongodb.com/atlas) (free tier OK)  
3. **Render** — [render.com](https://render.com) — sign up with GitHub  
4. **Vercel** — [vercel.com](https://vercel.com) — sign up with GitHub  

### A2. Push the project to GitHub

On your PC (inside the repo root that contains `frontend` and `backend`):

```bash
git init
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git add .
git commit -m "Initial VoteWise AI"
git push -u origin main
```

If the repo already exists, only `git add`, `commit`, `push` as usual.

**Check:** GitHub shows folders `frontend/`, `backend/`, and (if committed) `render.yaml`.

### A3. Never commit secrets

- Do **not** commit `.env` or `.env.local`.  
- Use **Render** / **Vercel** dashboards (or encrypted env vars) only for secrets.  
- Rotate any keys that ever appeared in chat or screenshots.

---

## Part B — MongoDB Atlas (database)

### B1. Create a cluster

1. Log into **Atlas**.  
2. **Build a Database** → choose **FREE (M0)** → pick a cloud region close to Render (e.g. `AWS Oregon` matches Render **Oregon**).  
3. Create cluster.

### B2. Create a database user

1. Atlas → **Database Access** → **Add New Database User**.  
2. **Password** authentication → save username + password (**store safely**).

### B3. Allow network access

1. Atlas → **Network Access** → **Add IP Address**.  
2. For a first deployment, use **`0.0.0.0/0`** (allow from anywhere).  
   - Tighten later using Render’s static IPs if you use a paid plan.  
3. Save.

### B4. Get connection string

1. Atlas → **Database** → **Connect** → **Drivers**.  
2. Copy the **URI** (looks like `mongodb+srv://USER:PASSWORD@cluster...`).  
3. Replace `<password>` with your user’s password (**URL-encode** special characters: `@` → `%40`, `#` → `%23`, etc.).  
4. Ensure the URI ends with a database name, e.g. `...mongodb.net/votewise_ai?retryWrites=true&w=majority`.

Keep this string for **Part C** as **`MONGO_URI`**.

---

## Part C — Deploy the backend on Render

You can use **Blueprint** (`render.yaml`) or a **manual Web Service**. Both are below.

### C1. Connect GitHub to Render

1. Render dashboard → **Account Settings** (or prompt when creating a service) → **Connect GitHub**.  
2. Authorize Render and **install** the GitHub app for **only** the repo you need (or all repos).  

### C2. Option 1 — Blueprint (recommended if `render.yaml` is in the repo root)

1. Render → **New +** → **Blueprint**.  
2. Connect the repository.  
3. Render reads **`render.yaml`** and proposes a service (e.g. **`votewise-api`**).  
4. Click **Apply** / **Create Blueprint**.  
5. For each env var marked **sync: false** (or empty), open the service → **Environment** and add values (see **C4**).  

### C3. Option 2 — Manual Web Service

1. Render → **New +** → **Web Service**.  
2. **Connect** your repository.  
3. Configure:  
   - **Name:** e.g. `votewise-api`  
   - **Region:** e.g. **Oregon** (US West)  
   - **Branch:** `main`  
   - **Root Directory:** `backend`  
   - **Runtime:** **Node**  
   - **Build Command:** `npm install && npm run build`  
   - **Start Command:** `npm start`  
   - **Instance type:** **Free** (acceptable; service may sleep when idle)  
4. **Advanced** → **Health Check Path:** `/api/health`  
5. **Create Web Service**.

### C4. Environment variables (Render — backend)

Open the service → **Environment** → add:

| Key | Required | Value / notes |
|-----|----------|----------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Usually no | Render sets `PORT` automatically; leave unset unless you know you need to override. |
| `MONGO_URI` | Yes | Full Atlas connection string from Part B. |
| `JWT_SECRET` | Yes | Long random string (e.g. 32+ characters). **Not** the default from dev. |
| `FRONTEND_URL` | Yes | **Exact** Vercel production origin: `https://something.vercel.app` — **no trailing slash**. See Part D first if you don’t have the URL yet; you can add it after first Vercel deploy and **redeploy** the API. |
| `GOOGLE_TRANSLATE_API_KEY` | Optional | If you use in-app translation. |
| `GOOGLE_TRANSLATE_REFERER` | Optional | Often `https://something.vercel.app/` (with slash) if your Google key is referrer-restricted; must match Google Cloud console. |
| `GEMINI_API_KEY` | Optional | For chat/AI features. |
| `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS` | Optional | Defaults exist in code. |
| `DEFAULT_ADMIN_*` | Optional | Only if you rely on seed defaults. |

**Important — CORS:** With `NODE_ENV=production`, the API only allows the origin **`FRONTEND_URL`** (plus dev localhost is **not** used in production). If login/API calls fail with CORS in the browser, **`FRONTEND_URL` is wrong** (www vs non-www, `http` vs `https`, trailing slash).

### C5. Wait for deploy and copy API URL

1. First deploy runs **install** → **build** (`tsc`) → **start** (`node dist/server.js`).  
2. When status is **Live**, note the URL:  
   `https://YOUR-SERVICE-NAME.onrender.com`  
3. Test in a browser:  
   `https://YOUR-SERVICE-NAME.onrender.com/api/health`  
   You should see JSON with `"status": "ok"`.

### C6. Seed the database (first time)

The app expects admin/quiz/timeline data from the seed script.

1. Render → your service → **Shell** (or **SSH** if enabled).  
2. Run from the service root (Render usually starts in `backend` if root dir is set):

```bash
npm install
npx tsx src/utils/seed.ts
```

If `tsx` is missing, run `npm install` (devDependencies must be present for `tsx`) or use Render’s default install that includes devDependencies for the build.

3. Confirm in Atlas **Collections** that data appeared.

---

## Part D — Deploy the frontend on Vercel

### D1. Import the project

1. Vercel → **Add New** → **Project**.  
2. **Import** the same GitHub repository.  
3. **Configure Project:**  
   - **Framework Preset:** Vite (auto-detected).  
   - **Root Directory:** click **Edit** → set to **`frontend`**.  
   - **Build Command:** `npm run build` (default).  
   - **Output Directory:** `dist` (default for Vite).  
4. Do **not** deploy yet — add env vars first (next step).

### D2. Environment variables (Vercel — build time)

Vercel → **Settings** → **Environment Variables**.

Add for **Production** (and **Preview** if you want preview deploys to work against a staging API):

| Name | Value |
|------|--------|
| **`VITE_API_BASE_URL`** | `https://YOUR-SERVICE-NAME.onrender.com/api` |
| All other `VITE_*` from your local `frontend/.env` | Same as local (Firebase, Maps, Calendar, GA, etc.) |

**Critical:** `VITE_API_BASE_URL` must end with **`/api`** because the Express app mounts routes under `/api`.

**Note:** Vite reads these **at build time**. After changing env vars, trigger **Redeploy** (**Deployments** → … → Redeploy).

### D3. Deploy

1. Click **Deploy**.  
2. When finished, open the **Production URL** — example: `https://votewise-ai-xxx.vercel.app`.

### D4. Finish CORS configuration on Render

1. Copy the **exact** production URL **without trailing slash**.  
2. Render → backend service → **Environment** → set **`FRONTEND_URL`** to that value.  
3. **Manual Deploy** → **Clear build cache & deploy** (or Save and let auto-redeploy).  

### D5. SPA routing

The repo includes **`frontend/vercel.json`** with a rewrite to **`index.html`** so React Router works on refresh and deep links.

---

## Part E — Google Cloud keys (Maps, Translate)

### Maps (browser key, `VITE_GOOGLE_MAPS_API_KEY`)

1. GCP → **APIs & Services** → enable **Maps Embed API**.  
2. **Credentials** → API key → **Application restrictions** → **HTTP referrers**.  
3. Add:  
   - `http://localhost:5173/*`  
   - `https://YOUR-PROJECT.vercel.app/*`  
   - (Optional) preview: `https://*.vercel.app/*`  

Add the same key value in **Vercel** env as **`VITE_GOOGLE_MAPS_API_KEY`** and redeploy.

### Translate (server key on Render)

Translation uses **`POST /api/translate`** → key is **`GOOGLE_TRANSLATE_API_KEY`** on **Render** (not exposed in browser).

If the key uses **website referrer restrictions**, outbound server calls must send **`GOOGLE_TRANSLATE_REFERER`** (often `https://your.vercel.app/`) matching GCP — see **`backend/.env.example`**.

---

## Part F — Verify end-to-end

1. **Health:** Open `https://YOUR-RENDER.onrender.com/api/health` → JSON OK.  
2. **SPA:** Open Vercel URL → homepage loads.  
3. **API from browser:** Open DevTools → **Network**. Trigger login or quiz; requests go to **`...onrender.com/api/...`** and return **200** (not blocked by CORS).  
4. **Maps:** Checklist → map widget or “Open in Google Maps” link.  
5. **Translate:** Change language → network shows **`/api/translate`** succeeding.

---

## Part G — Common problems

| Symptom | Likely fix |
|---------|------------|
| CORS errors in browser | **`FRONTEND_URL`** must exactly equal the SPA origin (scheme + host, no path). Fix on Render, redeploy. |
| API `404` on Vercel domain | Frontend must call **Render URL + `/api`**, not Vercel. Check **`VITE_API_BASE_URL`**, redeploy frontend. |
| Mongo connection failed | **`MONGO_URI`**, Atlas **Network Access** (`0.0.0.0/0`), password **URL-encoding**. |
| Render build fails (“tsc not found”) | Ensure **`npm install`** runs before **`npm run build`**; **`typescript`** must be installed (normally as devDependency on Render build). |
| First request slow (30s+) | **Free** Render tier **sleeps**; first hit wakes the service. Upgrade or accept cold starts. |
| Maps iframe error | Wrong referrer restriction; enable **Maps Embed API** + billing; match Vercel URL in key restrictions. |

---

## Order summary (recommended)

1. Push code to GitHub.  
2. Create **Atlas** cluster + **`MONGO_URI`**.  
3. Create Render **backend** → set **`MONGO_URI`**, **`JWT_SECRET`**, **`NODE_ENV`**; temporarily **`FRONTEND_URL`** can be placeholder **only if** you can’t skip CORS testing — ideally set **after** Vercel URL exists.  
4. Confirm **`/api/health`**.  
5. Run **seed**.  
6. Create Vercel project (**root `frontend`**), set **`VITE_API_BASE_URL`**, deploy.  
7. Set **`FRONTEND_URL`** on Render to the **Vercel production URL**, redeploy API.  
8. Add **`VITE_*`** / GCP keys → redeploy frontend as needed.

---

## Files in this repo that help deployment

| File | Purpose |
|------|---------|
| `render.yaml` | Render Blueprint for the API (`backend`). |
| `frontend/vercel.json` | SPA rewrite for React Router on Vercel. |
| `backend/.env.example` | Backend env checklist. |
| `frontend/.env.example` | Frontend `VITE_*` checklist. |
