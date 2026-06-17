# Supabase CMS Setup

This guide configures TaxChecker's production CMS on Supabase + Vercel.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Note the project URL and API keys from **Project Settings → API**.

## 2. Run the CMS migration

Open **SQL Editor** in Supabase and run:

`supabase/migrations/001_cms_schema.sql`

This creates:

- `admin_users`
- `cms_resources`
- `cms_blog_posts`
- `cms_calculator_metadata`
- `cms_audit_log`

Plus indexes, RLS policies, and `is_admin_user()` helper.

## 3. Create the first Supabase Auth user

1. In Supabase, open **Authentication → Users**.
2. Create a user with email + password (or invite yourself).

## 4. Grant admin access

Insert the user's email into `admin_users`:

```sql
insert into public.admin_users (email, role)
values ('you@example.com', 'owner');
```

Only emails listed here can access `/admin` when Supabase auth is enabled.

## 5. Set Vercel environment variables

| Variable | Scope | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview | **Server only** — never expose to client |
| `ADMIN_CONTENT_STORE` | Production | Set to `supabase` |

Optional:

| Variable | Purpose |
|----------|---------|
| `ADMIN_AUTH_MODE=password` | Force legacy dev password login (local only) |

## 6. Deploy

Push to Vercel. Production defaults:

- `ADMIN_CONTENT_STORE=supabase` when service role key is configured
- Supabase Auth for `/admin/login`

## 7. Verify

1. Visit `/admin/login` — sign in with your Supabase admin email.
2. Create or edit a blog post in `/admin/blog/new`.
3. Publish the post — confirm it persists after redeploy.
4. Visit `/blog` — published posts appear; drafts do not.
5. Check `/sitemap.xml` — published blog/resource URLs included.

## Seeding initial content

After migration, seed CMS tables from your local dev JSON or static registries:

- Resources: mirror entries from `src/config/resources.ts`
- Blog posts: create via admin UI or insert SQL
- Calculator metadata: mirror `src/config/calculators.ts`

The admin panel reads/writes Supabase directly — no `cms:export` step is required in Supabase mode.

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — used only in `src/lib/supabase/admin.ts` (server-only).
- Browser code uses the anon key only.
- Public site reads published rows via RLS (`status = 'published'`).
- Admin writes require Supabase Auth + `admin_users` membership.
