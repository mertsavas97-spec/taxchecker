# TaxChecker SEO Architecture

**Version:** 1.0  
**Last updated:** 2026-06-16  
**Scope:** Calculator-first federal tax utility site (YMYL financial content)

---

## Strategy

TaxChecker is **not a generic content blog**. It is a **calculator-led resource site**:

1. **Calculators are primary landing pages** — each targets a high-intent tax query with a working tool, methodology, sources, and FAQs.
2. **Guides and reference pages support calculators** — they explain concepts and link back to relevant tools.
3. **Trust signals are mandatory** — IRS source citations, methodology, disclaimers, and last-reviewed dates on every calculator.
4. **Programmatic SEO is secondary** — reference tables (brackets, deadlines) may be generated from verified config, never from unverified third-party data.

---

## URL Policy

| Pattern | Example | Notes |
|---------|---------|-------|
| Homepage | `/` | Brand hub; links to calculator clusters |
| Calculators | `/calculators/{engine-id}` | kebab-case engine id (e.g. `self-employed-tax`) |
| Resources | `/resources/{slug}` or top-level (`/methodology`) | Registry defines canonical route |
| Blog (future) | `/blog/{slug}` | Not in launch sitemap until published |
| Legal | `/disclaimer` | Always linked from calculators |

**Rules:**

- All canonical URLs use `https://taxchecker.app` via `src/lib/seo/urls.ts`.
- No trailing-slash duplication — paths are normalized without trailing slashes except root.
- Slug registry (`src/config/calculators.ts`) is the source of truth for calculator routes.
- Do not publish URLs in sitemap until `status: 'ready'` (calculators) or `status: 'publishable'` (resources).

---

## Metadata Policy

Implemented in `src/lib/seo/metadata.ts`.

Every calculator page must export:

- **Title** — primary keyword + brand suffix via `%s | TaxChecker` template
- **Meta description** — 150–160 chars, includes "estimate" / "not tax advice" where appropriate
- **Canonical URL** — `alternates.canonical`
- **Open Graph** — title, description, url, image (1200×630)
- **Twitter card** — `summary_large_image`
- **Robots** — `index, follow` for launch-ready pages; `noindex` for planned/draft

Use `buildCalculatorMetadata(calculator)` in future `generateMetadata()` exports.

---

## JSON-LD Schema Policy

Generators live in `src/lib/seo/schema/`.

| Schema | When to use |
|--------|-------------|
| `Organization` | Site-wide (layout or homepage) |
| `WebSite` | Site-wide with optional SearchAction |
| `BreadcrumbList` | All calculator and resource pages |
| `SoftwareApplication` | Every calculator page (`applicationCategory: FinanceApplication`) |
| `FAQPage` | Only when real FAQ content exists on the page — **never fake FAQs** |
| `Article` | Blog/guides only when published |

**Calculator schema rules:**

- `offers.price` = `"0"` (free tool)
- Include `disclaimer` text — do not claim professional tax advice
- `dateModified` from registry `lastUpdated`
- Publisher = TaxChecker organization

Render via `<JsonLd data={...} />` from `src/components/seo/json-ld.tsx`.

---

## Internal Linking Rules

1. **Every calculator** links to:
   - Related calculators (`relatedCalculatorSlugs` in registry)
   - Methodology (`/methodology`)
   - IRS sources (`/sources` or page-specific `sourceIds`)
   - Disclaimer

2. **Anchor text** — use descriptive labels ("Quarterly Tax Calculator"), not "click here".

3. **Hub pages** (future `/calculators`) group by category: self-employed, employment, business-entity, benefits.

4. **No orphan pages** — if a URL is in the sitemap, it must have ≥1 internal link from nav or a related block.

---

## `noindex` Rules

| Condition | Robots |
|-----------|--------|
| Calculator `status: 'planned'` | `noindex` if page accidentally deployed |
| Resource `status: 'planned'` or `'draft'` | `noindex` |
| Preview/staging hosts | `noindex` (env-based, future) |
| Thin or duplicate pages | `noindex` until substantive content exists |
| User-specific result URLs | Never index (no query-string result pages) |

`buildCalculatorMetadata` sets `noindex: true` when `status !== 'ready'`.

---

## Sitemap & Robots

- **`src/app/sitemap.ts`** — homepage + all `ready` calculators + `publishable` resources only
- **`src/app/robots.ts`** — allow `/`, disallow `/api/`, `/_next/`, `/dev/`, `/preview/`, `/admin/`
- `lastModified` from registry `lastUpdated` fields

---

## Future Programmatic SEO

Allowed when data is **verified**:

- Federal tax bracket tables from `TaxYearConfig`
- Quarterly due dates from `estimatedTax.quarterlyDueDates`
- HSA / retirement limits from config

**Not allowed without primary IRS source:**

- State tax pages
- "Best entity for you" recommendation pages
- AI-generated tax advice articles

---

## YMYL Content Quality Rules

Financial tax content is **Your Money Your Life (YMYL)**. Requirements:

1. **E-E-A-T signals** — methodology page, IRS source registry, last-reviewed dates, clear disclaimers
2. **No fabricated precision** — round displays appropriately; label as estimates
3. **No legal/classification advice** — especially W-2 vs 1099 and LLC vs S Corp
4. **Visible limitations** — state tax excluded, credits excluded, etc. (matches engine warnings)
5. **FAQ content** must answer real user questions documented in calculator specs — schema only when FAQs are on-page
6. **Update cadence** — bump `lastUpdated` when tax year config or calculator logic changes

---

## File Map

```
src/config/site.ts           — global site constants
src/config/calculators.ts      — calculator SEO registry
src/config/resources.ts        — resource page registry
src/lib/seo/urls.ts            — URL builders
src/lib/seo/metadata.ts        — Next.js Metadata builders
src/lib/seo/schema/            — JSON-LD generators
src/components/seo/json-ld.tsx — safe script renderer
src/app/robots.ts              — robots.txt
src/app/sitemap.ts             — XML sitemap
```

---

## Calculator Page Checklist (future sprints)

- [ ] `generateMetadata()` → `buildCalculatorMetadata(calculator)`
- [ ] `<JsonLd>` × 3: breadcrumb, calculator, FAQ (if FAQs present)
- [ ] `MethodologyBlock`, `IrsSourceBlock`, `DisclaimerPanel`
- [ ] `RelatedCalculatorsBlock` from `getRelatedCalculators(slug)`
- [ ] `FaqBlock` with spec-backed Q&A only
- [ ] Visible last-reviewed date in UI
