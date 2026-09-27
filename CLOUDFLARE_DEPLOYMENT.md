# Complete Cloudflare Deployment Guide (Free & Unlimited Traffic)

Cloudflare Pages provides **unlimited bandwidth, 0 egress fees, and global CDN caching across 300+ locations**, making it the best platform to host this application at high scale for $0.

---

### Understanding the Architecture on Cloudflare

1. **Client-Side Synthesis (Kokoro & Web Speech):**
   * Runs 100% on the visitor's device via WebGPU and WebAssembly.
   * Incurs **$0 server compute** on Cloudflare, regardless of how many millions of users synthesize audio.
2. **Server-Side Streaming API (`/api/edge-tts`):**
   * Uses Node.js WebSockets to stream Microsoft Edge Neural audio.
   * Cloudflare Pages natively supports Next.js with `@cloudflare/next-on-pages`.

---

### Step-by-Step: Deploy to Cloudflare Pages (via Git)

#### Step 1: Initialize Git and Commit
In your terminal:
```bash
git init
git add .
git commit -m "feat: multi-engine free TTS studio"
```

#### Step 2: Push to GitHub
1. Create a new repository on [github.com](https://github.com).
2. Link and push your repo:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git branch -M main
   git push -u origin main
   ```

#### Step 3: Connect to Cloudflare Pages
1. Log into your free [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, click **Compute (Workers & Pages)** > **Create application** > **Pages** tab.
3. Click **Connect to Git** and choose the repository you just pushed.

#### Step 4: Configure Build Settings
Fill in the deployment parameters:
* **Project Name:** `voiceover-studio` (or any custom subdomain)
* **Production Branch:** `main`
* **Framework Preset:** `Next.js`
* **Build Command:** `npx @cloudflare/next-on-pages` (or standard `npm run build`)
* **Build Output Directory:** `.vercel/output/static` (or `.next`)

#### Step 5: Configure Node.js Compatibility (Crucial)
Under **Environment Variables** in the Cloudflare deployment screen:
* Variable: `NODE_VERSION`
* Value: `20` or `22`

Under **Settings > Functions > Compatibility Flags**:
* Add flag: `nodejs_compat`

Click **Save and Deploy**. Cloudflare will build your application and assign you a global `*.pages.dev` URL with automatic free SSL!

---

### 🛡️ Accessing Your Hidden Admin Page

1. The Admin button has been **completely removed** from the public navigation.
2. If any unauthorized user attempts to open `/admin`, they only see a **generic 404 Page Not Found**.
3. **To unlock the login form:**
   * Open `/admin`.
   * Type the secret keyword: `kiwix` (lowercase, anywhere on the page).
   * The clean authentication modal will appear immediately with no demo details or placeholders.
4. **Credentials:**
   * **Username:** `admin`
   * **Password:** `Password@123`
