# Content Workflow

TaxChecker supports two CMS persistence modes controlled by `ADMIN_CONTENT_STORE`.

## Local file mode (development default)

```
ADMIN_CONTENT_STORE=file
```

- Content stored in `.data/content/*.json` (gitignored)
- Seeded from static registries on first run
- Admin password auth when Supabase env vars are not set
- Edits persist across local server restarts
- **Not suitable for Vercel production** (read-only/ephemeral filesystem)

## Supabase mode (production default)

```
ADMIN_CONTENT_STORE=supabase
```

Requires:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Behavior:

- All admin CMS reads/writes go to Supabase Postgres
- Edits survive Vercel redeploys and cold starts
- Supabase Auth + `admin_users` table gates admin access
- Public `/blog` and `/resources` read published rows via RLS
- Sitemap includes published Supabase content

No export/import step is needed in Supabase mode — the database is the source of truth for CMS-managed content.

## Memory mode (fallback)

```
ADMIN_CONTENT_STORE=memory
```

- In-process only; data lost on restart
- Used when Supabase is not configured in production
- Suitable for previews/CI only

## Auth modes

| Mode | When | Login |
|------|------|-------|
| Supabase Auth | Supabase env vars set (default) | Email + password at `/admin/login` |
| Dev password | No Supabase URL, or `ADMIN_AUTH_MODE=password` | Single password via `ADMIN_PASSWORD` |

## Publishing workflow

1. Create or edit content in admin (`/admin/blog`, `/admin/resources`).
2. Save draft — stored in active store (file or Supabase).
3. Publish — sets `status = 'published'` and `published_at`.
4. Public routes show only published content.
5. Drafts and archived items return 404 on public routes and are excluded from sitemap.

## Resources vs blog

| Content | Public route | Body source |
|---------|--------------|-------------|
| Blog posts | `/blog/[slug]` | CMS `content` field |
| Resources | `/resources/[slug]` | Static TSX pages (metadata/status from CMS when Supabase active) |

Resource article bodies remain in code for now; CMS controls metadata, status, and hub visibility.

## Related docs

- [Supabase CMS Setup](./supabase-cms-setup.md)
- [SEO Architecture](./seo-architecture.md)
