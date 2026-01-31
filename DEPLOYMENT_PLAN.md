# 🚀 Ultimate Deployment Plan

Your app uses **React (Frontend)** and **Supabase (Backend)**.
We will deploy the frontend to **Vercel**, which will automatically connect to your existing Supabase backend.

---

## Phase 1: Preparation (Done)
1.  **Codebase:** Optimized and production-ready.
2.  **Database:** Supabase is live and running.
3.  **Config:** `vercel.json` (auto-generated) and clean `package.json`.

---

## Phase 2: Deploy to Vercel (Do this now)

**Option A: The Easy Way (GitHub Integration)**
*Best for automatic updates when you push code.*

1.  **Push to GitHub:**
    Run these commands in your terminal if you haven't already:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/zenshin-web.git
    git branch -M main
    git push -u origin main
    ```
2.  **Go to Vercel:**
    -   Open [vercel.com/new](https://vercel.com/new).
    -   Select your **GitHub** account.
    -   Find `zenshin-web` and click **Import**.
3.  **Configure Project:**
    -   **Framework Preset:** Vite (should be auto-detected).
    -   **Root Directory:** `./`
4.  **Environment Variables (CRITICAL):**
    Copy these from your local `.env` file and paste them into the Vercel fields:
    -   `VITE_SUPABASE_URL` = `https://pmlqeadqunxayarlwdjb.supabase.co`
    -   `VITE_SUPABASE_ANON_KEY` = `sb_publishable_5wEPxceugasLHkR4RaWrAw_B0kc_hna`
5.  **Click Deploy.**

---

**Option B: The Hacker Way (Command Line)**
*Fastest for one-off deployment.*

1.  Run this command in your VS Code terminal:
    ```bash
    vercel
    ```
2.  Follow the interactive prompts:
    -   Log in to Vercel (opens browser) -> **Yes**.
    -   Set up and deploy? -> **Yes (y)**.
    -   Which scope? -> **(Select your username)**.
    -   Link to existing project? -> **No (n)**.
    -   Project Name -> `zenshin-web`.
    -   In which directory? -> `./`.
    -   **Auto-detect .env?** -> **YES (y)** (This uploads your keys automatically!).
3.  Wait 1 minute. You will get a link: `https://zenshin-web.vercel.app`.

---

## Phase 3: Verify
1.  Open your new Vercel link.
2.  Click **"Get the App"** -> Should trigger a download.
3.  Go to `/admin` (add `/admin-login` to URL) -> Log in.
4.  Check if the dashboard shows stats.

**You are done! 🎉**
