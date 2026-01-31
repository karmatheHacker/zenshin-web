# Deployment Guide

You can deploy your **Zenshin Web** app for **FREE** using **Vercel** or **Netlify**. Both platforms are excellent, free for hobby projects, and support React/Vite out of the box.

## Option 1: Vercel (Recommended)
*Fastest and easiest for React apps.*

### Method A: Connect with GitHub (Best)
1.  Push your code to a GitHub repository.
2.  Go to [vercel.com](https://vercel.com) and sign up/login.
3.  Click **"Add New"** > **"Project"**.
4.  Import your `zenshin-web` repository.
5.  **Environment Variables**:
    *   Expand the "Environment Variables" section.
    *   Add the keys from your `.env` file:
        *   `VITE_SUPABASE_URL` : `your_supabase_url`
        *   `VITE_SUPABASE_ANON_KEY` : `your_actual_key_here`
6.  Click **"Deploy"**.

### Method B: Deploy from Command Line
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in your project folder.
3.  Follow the prompts (Login -> Set up project -> Yes -> Yes).
4.  When asked for Environment Variables, you can configure them in the dashboard link it gives you.

---

## Option 2: Netlify
*Great alternative with drag-and-drop support.*

### Method A: Drag & Drop (No Git needed)
1.  Run `npm run build` on your computer (this creates a `dist` folder).
2.  Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3.  Drag and drop the **`dist`** folder into the browser window.
4.  **Important**: The site will break slightly because it's missing Env Variables.
5.  Go to **Site Settings** > **Environment variables**.
6.  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
7.  Go to **Deploys** and "Trigger Deploy" (or just re-upload).

### Method B: GitHub
1.  Push to GitHub.
2.  Log in to Netlify -> "Add new site" -> "Import an existing project".
3.  Connect GitHub -> Select Repo.
4.  Add Environment Variables in "Advanced build settings" or in dashboard after.
5.  Deploy.

---

## ⚠️ Critical Step: Environment Variables
For both platforms, you **MUST** add your Supabase keys in their dashboard settings. The `.env` file on your computer is NOT uploaded for security reasons.

**Keys to add:**
1.  `VITE_SUPABASE_URL`
2.  `VITE_SUPABASE_ANON_KEY`
