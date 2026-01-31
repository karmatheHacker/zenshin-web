# How to Get Indexed on Google

Congratulations on your domain! To appear in Google search results, you must explicitly tell Google your site exists.

## Step 1: Google Search Console (Essential)
1.  Go to **[Google Search Console](https://search.google.com/search-console)**.
2.  Log in with your Google account.
3.  **Add Property**:
    *   Select **"Domain"** (Recommended).
    *   Enter your domain (e.g., `zenshin.app`) without `https://`.
    *   Click **Continue**.

## Step 2: Verify Ownership
Google needs to know you own the domain.
1.  It will give you a **TXT record** (a weird string of text).
2.  Go to where you bought your domain (GoDaddy, Namecheap, Vercel).
3.  Find **DNS Settings** -> **Add Record**.
    *   **Type**: TXT
    *   **Name/Host**: `@` (or leave blank)
    *   **Value**: Paste the text from Google.
4.  Wait 5 minutes, then click **Verify** in Search Console.

## Step 3: Submit Sitemap
I have automatically created a `sitemap.xml` file for you in your project.
1.  In Search Console sidebar, click **"Sitemaps"**.
2.  Enter `sitemap.xml` in the box.
3.  Click **Submit**.
    *   *Note: If you are not using `zenshin.app`, update `public/sitemap.xml` and `public/robots.txt` with your actual domain first!*

## Step 4: Request Indexing
1.  In Search Console, paste your full URL (e.g., `https://zenshin.app`) into the top search bar.
2.  It will say "URL is not on Google".
3.  Click **"Request Indexing"**.

## Timeline
*   It typically takes **24-48 hours** for Google to crawl your site.
*   It can take **1-2 weeks** to appear in search rankings for specific keywords like "Zenshin Reader".
