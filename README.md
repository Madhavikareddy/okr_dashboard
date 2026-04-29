# Quarterly Nexus

A modern OKR & quarterly tracking dashboard inspired by `quarterly-nexus-hub`.
Where every department aligns each quarter — OKRs, tasks, calendar, reports.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn-style
UI primitives · Framer Motion · Supabase (Auth + Postgres + RLS) · Recharts.

## Features

- Marketing landing page with animated hero & feature grid (Framer Motion).
- Email/password auth via Supabase, with department selection
  (IT / Finance / Marketing / Sales / HR).
- Protected dashboard with sidebar navigation:
  - **Overview** — quarter-at-a-glance stats & upcoming events.
  - **OKRs** — create/edit objectives, animated cards, progress slider, status.
  - **Tasks** — Kanban-style board (To do / In progress / Done) with priority.
  - **Calendar** — month grid with events.
  - **Teams** — members grouped by department.
  - **Reports** — Recharts bar/pie charts of progress and status.
  - **Settings** — update profile.
- Server Components for data loading; Client Components for interactivity.
- Row-Level Security: every user only sees their own data.

## Getting started

### 1. Install
```bash
npm install
```

### 2. Configure Supabase
1. Create a new project at https://supabase.com.
2. Open the SQL Editor and run [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
4. In Supabase **Authentication → URL Configuration**, add:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`

### 3. Run
```bash
npm run dev
```
Open http://localhost:3000.

## Project structure

```
src/
  app/
    layout.tsx, page.tsx, globals.css
    auth/                 # /auth, /auth/callback
    dashboard/
      layout.tsx, page.tsx (Overview)
      okrs/, tasks/, calendar/, teams/, reports/, settings/
  components/
    landing/sections.tsx
    dashboard/sidebar.tsx, page-header.tsx
    ui/                   # button, card, dialog, input, select, ...
  lib/
    supabase/{client,server,middleware}.ts
    utils.ts
supabase/schema.sql
```

## Notes

- Auth is enforced by `src/middleware.ts` + the Supabase SSR cookies helpers.
- All data tables use RLS so a user only ever reads/writes their own rows.
  The `profiles` table is readable to any authenticated user (for the Teams
  view); modify the policies in `supabase/schema.sql` if you need stricter
  rules.
- The marketing page mirrors the structure of the original Quarterly Nexus
  Hub site (hero → features → CTA) but is built from scratch.
