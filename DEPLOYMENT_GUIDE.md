# High-Traffic Free Deployment Guide

This application is architected specifically so you can scale to **millions of requests with $0 hosting and $0 API costs**.

### 🌟 Hosting Recommendations

| Provider | Bandwidth Allowance | Best For | How to Deploy |
| :--- | :--- | :--- | :--- |
| **Vercel** *(Fastest & Zero Setup)* | 100 GB / month free | Next.js API Routes + Serverless Edge TTS | Push to GitHub, import repo on [vercel.com](https://vercel.com). Deploy button works automatically with zero config. |
| **Cloudflare Pages** *(Unlimited Bandwidth)* | **Unlimited free bandwidth & requests** | Massive traffic & viral apps | Connect GitHub repo on Cloudflare Pages, choose Next.js preset. |
| **Netlify** | 100 GB / month free | Global edge deployment | Connect GitHub repo on Netlify, Next.js runtime plugin auto-configures. |

---

### 🚀 Deploying to Vercel in 2 Minutes:
1. Initialize git if not already:
   ```bash
   git init
   git add .
   git commit -m "feat: multi-engine free TTS studio"
   ```
2. Push your repo to GitHub.
3. Go to [vercel.com/new](https://vercel.com/new), select your repo, and click **Deploy**.
4. Both the frontend and the Edge TTS streaming API route (`/api/edge-tts`) will work globally out of the box.

---

### 🛡️ Admin Access in Production
* **URL:** `https://your-domain.com/admin`
* **Username:** `admin`
* **Password:** `Password@123`
