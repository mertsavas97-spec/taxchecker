# Local Launch Polish Audit — Sprint 29

Audit date: June 2026  
Scope: Local pre-launch polish before domain/Vercel deployment.

## Pages audited

| Page | Route |
|------|-------|
| Homepage | `/` |
| Calculators hub | `/calculators` |
| Resources hub | `/resources` |
| Blog hub | `/blog` |
| Calculator detail | `/calculators/self-employed-tax` |
| Resource article | `/resources/self-employment-tax-guide` |
| About | `/about` |
| Admin login | `/admin/login` |
| Admin dashboard | `/admin` |

---

## Issues found

### Visual consistency
- Homepage hero H1 used `sm:text-4xl`, overshooting hub page heading scale.
- Resource metadata bar repeated tax year, last reviewed, and reading time already shown in sidebar.
- Blog hub showed search/filter UI when zero published posts existed, making the page feel broken.

### Resource articles
- Table of contents hidden below `xl`, while sidebar appeared at `lg` — awkward mid-breakpoint layout.
- No mobile TOC; sidebar related links appeared after FAQ/Sources on small screens.
- Sidebar column slightly wide; FAQ/source spacing could be tighter.

### Blog
- Empty state was a single dashed line with no CTAs.
- Draft admin posts correctly excluded from public — no issue.

### Admin
- CMS store driver (`file` / `memory` / `supabase`) not visible in UI.
- No mobile admin navigation below `md`.
- Login page lacked local dev guidance; Suspense fallback was empty.
- Dashboard recent-content table had no empty state.

### Navigation
- Primary nav correctly limited to Calculators · Resources · About.
- Blog intentionally **not** added to primary nav while no published posts exist (avoids dead-end nav item).
- Methodology remains in footer/resources/sidebar only.

### Mobile
- Resource article: related content buried below FAQ on mobile.
- Admin: no way to reach CMS sections without typing URLs on small screens.

---

## Fixes applied

| Area | Fix |
|------|-----|
| Blog empty state | New `BlogEmptyState` with title, explanation, Resources/Calculators CTAs; hides filters when empty |
| Resource article | Mobile collapsible TOC; sidebar moved above FAQ on mobile; TOC at `lg+`; tighter grid/sidebar |
| Resource metadata | Trust signals + compact reading time/review line; removed duplicate tax-year chip |
| Admin header | Store mode badge (`Local file store` / `Supabase CMS` / `Memory store`) |
| Admin mobile | Horizontal scroll nav strip below header on `<md` |
| Admin login | Local dev notice, skeleton loading state, clearer copy |
| Admin dashboard | Empty state for recent content table |
| Homepage | Removed hero H1 size override for heading consistency |

---

## Remaining local-only limitations

- **Blog discoverability:** `/blog` is not in primary nav until published posts justify it. Reachable via direct URL and sitemap.
- **Resource bodies:** Article prose remains in code modules; CMS controls metadata/status only.
- **Supabase optional locally:** Default store is `file` (`.data/content/`). Supabase requires env vars + migration.
- **Admin auth locally:** Password login when Supabase URL is unset; production will use Supabase Auth.
- **No domain/SSL/analytics:** Not configured — intentional for local phase.
- **Calculator nav:** Static nav groups; new calculators require config updates.

---

## Known production prerequisites (not in this sprint)

1. Supabase project + migration + `admin_users` seed
2. Vercel env vars (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_CONTENT_STORE=supabase`)
3. Custom domain + DNS
4. Publish first blog post(s) before adding Blog to primary nav
5. Production smoke test: admin login, CMS persist, public /blog and /resources

---

## Validation

| Check | Result |
|-------|--------|
| `npm run typecheck` | Pass |
| `npm test` | 86 tests passed (14 files) |
| `npm run build` | Pass — 39 routes |

Build note: Turbopack warns about file-store tracing via sitemap → expected for local file CMS; no action needed before deploy.
