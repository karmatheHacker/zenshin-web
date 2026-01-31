# Deployment Architecture

## You are using a "Serverless" Architecture
Good news! You **DO NOT** need to deploy a separate backend to Render.
Your application is built with **React** (Frontend) and **Supabase** (Backend-as-a-Service).

| Component | Technology | Hosting | Status |
| :--- | :--- | :--- | :--- |
| **Frontend** | React + Vite | **Vercel** | Ready to Deploy |
| **Backend** | Supabase | **Supabase Cloud** | **Already Live** |
| **Database** | PostgreSQL | **Supabase Cloud** | **Already Live** |

## Why no Render?
Render is typically used for hosting Node.js/Python servers (e.g., Express.js). Since your app talks directly to Supabase from the browser (using the `supabase-js` client), you skip the "middleman" server entirely. This makes your app faster and cheaper to host.

---

## Final Step: Deploy Frontend to Vercel
Since you are already logged in to Supabase, you only need to push your React code to Vercel.

### Instructions (Run in Terminal)
1.  Run the command:
    ```bash
    vercel
    ```
2.  **Login**: It will open your browser. Log in with GitHub or Email.
3.  **Setup**:
    -   Set up and deploy? **Yes** (`y`)
    -   Scope? (Select your name)
    -   Link to existing project? **No** (`n`)
    -   Project Name: `zenshin-web`
    -   Directory: `./`
4.  **Environment Variables**:
    -   It will ask to override settings.
    -   **Important:** You need to go to the Vercel Dashboard (website) after the project is created to add your credentials:
        *   `VITE_SUPABASE_URL`
        *   `VITE_SUPABASE_ANON_KEY`
    -   *Or*, if your CLI detects the local `.env`, accept importing it!

### That's it!
Once Vercel finishes, you will get a link like `https://zenshin-web.vercel.app`.
