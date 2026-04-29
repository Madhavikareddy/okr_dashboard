# Deploying Quarterly Nexus to Netlify

This Next.js 14 App Router + Supabase app is fully Netlify-ready.

## 1. Push your code

Already done — your repo lives at:
**https://github.com/Madhavikareddy/okr_dashboard**

## 2. Create a Netlify site

1. Go to https://app.netlify.com/start
2. Click **"Import from Git"** → **GitHub**
3. Authorize Netlify (one-time) and pick the **`okr_dashboard`** repo
4. Netlify auto-detects Next.js. The settings should be:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Functions directory:** (leave empty — handled by the plugin)

   These are all already pinned in `netlify.toml`, so you can just click **Deploy**.

## 3. Add environment variables

Before the first deploy succeeds you **must** add your Supabase secrets:

**Site settings → Environment variables → Add variable**

| Key                              | Value                                  |
| -------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | `https://YOUR-PROJECT.supabase.co`     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | your project's `anon` public key       |

> Copy these from **Supabase → Project Settings → API**.

After adding them, hit **"Trigger deploy → Deploy site"**.

## 4. Configure Supabase Auth redirects

In **Supabase → Authentication → URL Configuration**:

- **Site URL:** `https://YOUR-NETLIFY-SITE.netlify.app`
- **Redirect URLs (allow list):**
  - `https://YOUR-NETLIFY-SITE.netlify.app/**`
  - `http://localhost:3000/**` (for local dev)

This is required for email magic-links and OAuth callbacks (`/auth/callback`).

## 5. Run the database migrations

In the Supabase SQL editor, run these in order if you haven't yet:

1. `supabase/schema.sql`
2. `supabase/002_migrations.sql`
3. `supabase/003_migrations.sql`

## 6. Done!

Visit your Netlify URL. The landing page is the entry point; "Sign in" / "Get started"
hands off to Supabase auth, then the dashboard at `/dashboard`.

---

## Future deploys

Every push to `main` triggers an automatic Netlify rebuild. To deploy a feature branch
preview, push it and Netlify will give you a unique preview URL.

## Local production preview

```powershell
npm run build
npm run start
```

## Troubleshooting

- **Blank page / 500s right after deploy** — almost always missing/typo'd env vars.
  Check **Site → Logs → Functions** for the runtime error.
- **OAuth/magic link redirects to localhost** — fix the Supabase Site URL (step 4).
- **Stale build cache** — Netlify → Deploys → "Clear cache and deploy site".
