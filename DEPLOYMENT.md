# TARANG: Permanent Free-Tier Hosting Guide 🚀
*How to host the entire industrial stack for free & keep it 100% "Always-On" for judges.*

To ensure judges never see a "Server Down" error, we will use a **Distributed Multi-Cloud Strategy**.

---

## 0. Create a GitHub Repository (Prerequisite)
Render and Vercel both deploy directly from your GitHub code.
1.  **Create Account:** Go to [GitHub.com](https://github.com/) and sign up.
2.  **New Repo:** Click the **+** icon (top right) > **New repository**.
    - **Name:** `tarang-industrial`
    - **Visibility:** **Public** (Required for some free tiers, and for judges to see code if needed).
    - **Initialize:** Leave everything else unchecked (No README, no gitignore).
3.  **Upload Code:**
    - Open your terminal in the `d:\Teliport` folder.
    - Run these commands one by one:
      ```bash
      git init
      git add .
      git commit -m "Initialize Industrial Tarang Platform"
      git branch -M main
      git remote add origin https://github.com/YOUR_USERNAME/tarang-industrial.git
      git push -u origin main
      ```
4.  **Verify:** Refresh your GitHub page; you should see your folders (`tarang-api`, `tarang-web`, etc.) there.

---

## 1. The Database (Neon PostgreSQL)
Neon offers a powerful free tier that never sleeps (cold starts are very fast, or we keep it awake).
1.  Go to [Neon.tech](https://neon.tech/) and sign up (No credit card required).
2.  Create a project named `tarang-industrial`.
    - **Postgres Version:** Choose **v16** (Latest & Fastest).
    - **Region:** Choose **Asia Pacific (Singapore)** as the safest common region. 
      > [!TIP]
      > If **Mumbai** is available as a free option in all three (Neon, Upstash, AND Render), choose Mumbai. Otherwise, stick to **Singapore** for all services to avoid cross-region latency.
    - **Neon Auth:** Keep this **OFF** (We use our own custom Industrial JWT logic).
3.  Copy your **Connection String** (Postgres URL). It will look like: 
    `postgresql://user:password@cloud-id.region.pooler.neon.tech/neondb?sslmode=require`
4.  **Save this URL.** You will need it for the Backend.

---

## 2. The Message Broker (Upstash Redis)
Required for Celery background workers to handle heavy AI tasks.
1.  Go to [Upstash.com](https://upstash.com/) and sign up.
2.  In the Console, click **Create Database**.
    - **Name:** `tarang-broker`
    - **Type:** Standard (Free).
    - **Region:** Choose the **SAME** region you picked for Neon (e.g., **Singapore** or **Mumbai**).
    - **TLS/SSL:** Usually enabled by default (No action needed if you don't see the toggle).
    - **Eviction:** Keep this **OFF**.
      > [!IMPORTANT]
      > For a message broker (Celery), you want all tasks to be delivered. If eviction is ON, Redis might delete old "waiting" tasks to make room for new ones, which can lead to missed screenings.
3.  Scroll down to the **Node.js / Python** section.
4.  Copy the **REDIS_URL**. It will look exactly like this (use the one starting with `redis://`):
    `redis://default:YOUR_PASSWORD@your-endpoint.upstash.io:32371`
5.  **Note:** Celery requires the `redis://` protocol (not `rediss://` usually, unless explicitly configured, so stick to the provided URL).

---

## 3. The Backend API & Workers (Render)
Render allows us to host **Docker Containers** for free. 
> [!IMPORTANT]
> Render's free tier "spins down" after 15 mins of inactivity. We will use the **Cron-Ping Hack** (Step 5) to prevent this.

1.  **Preparation:** Push your code to a GitHub repository.
2.  Go to [Render.com](https://render.com/) and connect your GitHub.
3.  **Deploy API:**
    -   Select **New > Web Service**.
    -   Connect your `tarang` repo.
    -   Specify `Dockerfile` path: `tarang-api/Dockerfile`.
    -   **Environment Variables:**
        -   `DATABASE_URL`: (Your Neon URL)
        -   `REDIS_URL`: (Your Upstash URL)
        -   `SECRET_KEY`: (A random long string)
4.  **Deploy Worker:**
    -   Select **New > Background Worker**.
    -   Connect the same repo.
    -   Path: `tarang-api/Dockerfile`.
    -   **Command Override:** `celery -A app.worker worker --loglevel=info` (Optional, usually handled in Docker).
    -   Use the same Env Vars as the API.

---

## 4. The Frontend (Vercel)
Vercel is the gold standard for Next.js.
1.  Go to [Vercel.com](https://vercel.com/) and sign up.
2.  Select **New Project** and import your `tarang` repo.
3.  **Root Directory:** Set to `tarang-web`.
4.  **Environment Variables:**
    -   `NEXT_PUBLIC_API_URL`: (Your Render API URL, e.g., `https://tarang-api.onrender.com`)
5.  Click **Deploy**.

---

## 5. THE CRITICAL STEP: Keep Always-On (Cron-job.org)
If you don't do this, the server will "sleep" and judges will think it's broken.
1.  Go to [Cron-job.org](https://cron-job.org/) (Free forever).
2.  Create a **New Cronjob**.
3.  **URL to call:** `https://your-tarang-api.onrender.com/health`
4.  **Execution schedule:** Every **10 minutes** (0 */10 * * *).
5.  This "pings" your server 24/7, keeping it awake even if no one is using it.

---

## 6. Verification Checklist for Judges
1.  **Check Health:** Open `https://your-api.onrender.com/health`. Should return `{"status": "healthy"}`.
2.  **Check DB:** Run a test screening; verify it saves to the "Reports" archive.
3.  **Check Demo:** Press "Run Full Demo" in the Navbar. Ensure all agent steps turn green.

---
**Good luck at TELIPORT Season 3!**  
*Your project is now officially an Always-On Enterprise Prototype.*
