# Launch SEO Audit — TaxChecker.app

**Audit date:** 2026-06-16  
**Sprint:** 24 — Internal Linking & Launch SEO QA  
**Scope:** All public routes, metadata, structured data, sitemap, robots, internal linking, copy safety

---

## Executive summary

TaxChecker.app is **launch-ready from an SEO and crawl perspective** after Sprint 24 fixes. All public calculator and resource pages are indexable, internally linked, and carry consistent metadata and structured data. One legacy route (`/guides`) now permanently redirects to `/resources` and is excluded from the sitemap.

**Remaining launch blockers:** None identified in this audit. Optional post-launch: custom OG images per route (`/og/calculators/*`, `/og/resources/*`), Search Console verification, and monitoring indexed URLs after deploy.

---

## Routes audited

### Indexable (21 sitemap URLs)

| Route | Type | Metadata | Schema |
|-------|------|----------|--------|
| `/` | Homepage | ✓ unique | Organization, WebSite |
| `/calculators` | Hub | ✓ unique | BreadcrumbList, CollectionPage |
| `/resources` | Hub | ✓ unique | BreadcrumbList, CollectionPage |
| `/calculators/self-employed-tax` | Calculator | ✓ | BreadcrumbList, SoftwareApplication, FAQPage |
| `/calculators/1099-tax` | Calculator | ✓ | BreadcrumbList, SoftwareApplication, FAQPage |
| `/calculators/quarterly-tax` | Calculator | ✓ | BreadcrumbList, SoftwareApplication, FAQPage |
| `/calculators/estimated-tax` | Calculator | ✓ | BreadcrumbList, SoftwareApplication, FAQPage |
| `/calculators/w2-vs-1099` | Calculator | ✓ | BreadcrumbList, SoftwareApplication, FAQPage |
| `/calculators/s-corp-tax` | Calculator | ✓ | BreadcrumbList, SoftwareApplication, FAQPage |
| `/calculators/llc-vs-scorp` | Calculator | ✓ | BreadcrumbList, SoftwareApplication, FAQPage |
| `/calculators/hsa-tax` | Calculator | ✓ | BreadcrumbList, SoftwareApplication, FAQPage |
| `/resources/self-employment-tax-guide` | Resource | ✓ | BreadcrumbList, Article, FAQPage |
| `/resources/quarterly-tax-guide` | Resource | ✓ | BreadcrumbList, Article, FAQPage |
| `/resources/tax-brackets-2025` | Resource | ✓ | BreadcrumbList, Article, FAQPage |
| `/resources/quarterly-tax-due-dates-2025` | Resource | ✓ | BreadcrumbList, Article, FAQPage |
| `/about` | Trust | ✓ | BreadcrumbList |
| `/contact` | Trust | ✓ | BreadcrumbList |
| `/methodology` | Trust | ✓ | BreadcrumbList |
| `/privacy` | Trust | ✓ | BreadcrumbList |
| `/terms` | Trust | ✓ | BreadcrumbList |
| `/disclaimer` | Trust | ✓ | BreadcrumbList |

### Redirect (not in sitemap)

| Route | Behavior |
|-------|----------|
| `/guides` | `308` permanent redirect → `/resources` (legacy placeholder removed from crawl index) |

### Excluded from sitemap (intentional)

| Item | Reason |
|------|--------|
| Planned calculators (`status: planned`) | Not deployed; metadata would be `noindex` if exposed |
| Coming soon resources | None currently — all hub resources are `published` |
| `/methodology` as `/resources/*` duplicate | Canonical trust route only; registry entry points to `/methodology` |
| `/api/`, `/_next/`, `/dev/`, `/preview/`, `/admin/` | Blocked in `robots.ts` |

---

## Issues found & fixes made (Sprint 24)

### Internal linking

| Issue | Fix |
|-------|-----|
| `/guides` placeholder in sitemap and crawlable as thin content | Permanent redirect to `/resources`; excluded from sitemap via `getSitemapTrustPages()` |
| Homepage lacked direct link to resources hub | Added “Browse resources” button in methodology section; authority strip links to `/calculators` and `/resources` |
| HSA calculator had only 2 related resources | Added `self-employment-tax-guide` to related resource slugs |
| Coming soon resources could appear in related blocks | `buildRelatedGuideLinks()` now includes **published resources only** (no non-crawlable placeholders) |
| Inconsistent related section labels | Centralized copy in `src/config/related-content.ts` |

### Metadata

| Issue | Fix |
|-------|-----|
| Placeholder trust pages (`guides`) lacked automatic `noindex` | `buildStaticPageMetadata()` sets `noindex` when `page.placeholder === true` |

### Structured data

| Issue | Fix |
|-------|-----|
| Article schema could omit `image` (undefined) | Article JSON-LD now falls back to `site.defaultOgImage` |

### Copy safety

| Issue | Fix |
|-------|-----|
| “official IRS Form 1040-ES” on due dates page | Changed to “IRS-published Form 1040-ES” |

---

## Internal linking status

### Calculator pages (8/8)

- ✓ Each links to **Related calculators** (registry-driven, ready calculators only)
- ✓ Each links to **Related resources** (2–4 published guides per calculator)
- ✓ Each includes **IRS & official sources** block
- ✓ Each includes **Methodology** content block with link to `/methodology`
- ✓ Footer/header navigation reaches all calculators and hubs

### Resource pages (4/4 + methodology)

- ✓ Each links to **Related calculators** (2–3 per resource via registry)
- ✓ Each links to **Related resources** (2–3 cross-links via registry)
- ✓ Each includes **IRS sources**, **FAQ**, metadata bar

### Homepage

- ✓ Hero → `/calculators`, popular calculator
- ✓ Authority strip → `/calculators`, `/resources`, `/methodology`
- ✓ Featured grid → all 8 calculators
- ✓ Methodology section → `/methodology`, `/resources`

### Hubs

- ✓ `/calculators` — all 8 calculators via `CalculatorHubFilter`
- ✓ `/resources` — all 5 published registry entries (4 articles + methodology card linking to `/methodology`)

### Header & footer

- ✓ Header: Calculators dropdown (hub + 8), Resources (`/resources`), Methodology
- ✓ Footer: All Calculators hub + 8 calculators, Resources + Methodology, Company (About, Contact), Legal (Privacy, Terms, Disclaimer)
- ✓ No dead links identified

---

## Metadata status

All public pages use `assembleMetadata()` or equivalent with:

- ✓ Unique `title` and `description` per route
- ✓ Canonical URL via `metadataBase` + `alternates.canonical`
- ✓ Open Graph (`summary_large_image`, site name, locale, URL, image)
- ✓ Twitter card (`summary_large_image`)
- ✓ OG image fallback: `/og/default.png` or route-specific path where configured
- ✓ `robots: index, follow` on all launch pages
- ✓ `noindex` only for: placeholder trust pages, non-ready calculators (none deployed), non-published resources (none in hub)

---

## Structured data status

| Page type | Schema types | Notes |
|-----------|--------------|-------|
| Homepage | Organization, WebSite | No tax advice claims; disclaimer in org description context |
| Calculator hub | BreadcrumbList, CollectionPage | ItemList of 8 SoftwareApplication entries |
| Resources hub | BreadcrumbList, CollectionPage | ItemList of published articles only |
| Calculator pages | BreadcrumbList, SoftwareApplication, FAQPage | `disclaimer` field on SoftwareApplication; free Offer |
| Resource pages | BreadcrumbList, Article, FAQPage | Author/publisher = TaxChecker org; OG image fallback |
| Trust/legal | BreadcrumbList | No Article schema (appropriate for policy pages) |

**Validation notes:**

- No `undefined`/`null` values emitted in JSON-LD (Article `image` uses fallback)
- Schemas do not claim IRS affiliation or tax advice
- FAQ schema omitted when FAQ list is empty (not applicable to current pages)

---

## Sitemap status

**File:** `src/app/sitemap.ts`

**Included (21 URLs):**

1. `/`
2. `/calculators`
3. `/resources`
4.–11. Eight calculator routes (`getReadyCalculators()`)
12.–17. Six trust pages (`getSitemapTrustPages()` — excludes placeholder `/guides`)
18.–21. Four published resource article routes (`/resources/*` only)

**Excluded:**

- `/guides` (redirects)
- `/methodology` duplicate via resources registry (listed once as trust page)
- Planned calculators and coming soon resources
- Internal/dev paths

---

## Robots status

**File:** `src/app/robots.ts`

- ✓ `Sitemap: https://taxchecker.app/sitemap.xml`
- ✓ `Host: https://taxchecker.app`
- ✓ `Allow: /`
- ✓ `Disallow: /api/, /_next/, /dev/, /preview/, /admin/`

---

## Dead link status

**Result: PASS** — No broken internal links found in header, footer, hubs, calculator pages, or resource pages after Sprint 24 fixes.

---

## Copy safety status

### Scan targets

Searched public-facing `src/` copy for: `guaranteed`, `exact tax`, `tax advice`, `legal advice`, `you should`, `we recommend`, `best option`, `IRS approved`, `official IRS`, `file this way`, `Recommended` (UI labels).

### Findings

| Location | Finding | Status |
|----------|---------|--------|
| Disclaimers site-wide | “not tax advice” in negation context | ✓ Safe |
| FAQ answers | “Is this tax advice? → No.” | ✓ Safe |
| Safe harbor copy | “does not guarantee zero balance due” | ✓ Safe (negation) |
| SE tax guide FAQ | “how you should file” in negation | ✓ Safe |
| Quarterly due dates page | “official IRS Form” | **Fixed** → “IRS-published Form” |
| Engine `Recommended` payment labels | Overridden in UI via `applyPrimaryLabelOverrides` → “Estimated quarterly payment” | ✓ Safe (display layer) |
| W-2 vs 1099 | “Higher estimated value” not “best option” | ✓ Safe |
| Entity calculators | “not a recommended reasonable amount” (negation) | ✓ Safe |

### Intentionally unchanged (engine layer — out of scope)

- Internal engine field names (`recommendedQuarterlyPaymentCents`) — not user-visible after UI overrides
- Engine disclaimer strings containing “not tax advice” — appropriate legal context

---

## Related content consistency

Shared constants: `src/config/related-content.ts`

| Section | Title | Used on |
|---------|-------|---------|
| Related calculators | “Related calculators” | All calculator + resource pages |
| Related resources | “Related resources” | All calculator + resource pages (via RelatedGuidesBlock) |
| IRS sources | “IRS & official sources” | Calculator pages, resource pages |
| Methodology | Link: “Read the full TaxChecker methodology” → `/methodology` | All calculator MethodologyBlock instances |

---

## Quality gates

| Check | Result |
|-------|--------|
| `npm run typecheck` | ✓ Pass |
| `npm run test` | ✓ 86 tests pass |
| `npm run build` | ✓ 27 routes (21 indexable + `/guides` redirect + system routes) |

---

## Remaining launch blockers

None from this audit.

### Recommended post-launch (non-blocking)

1. Submit sitemap in Google Search Console after DNS/deploy
2. Verify OG images exist at configured paths or add route-specific assets
3. Monitor crawl stats for `/guides` → `/resources` redirect consolidation
4. Add `sameAs` social profiles to Organization schema when available
