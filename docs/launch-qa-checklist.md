# Launch QA Checklist — TaxChecker Calculator Pages

Use this checklist before publishing the homepage or announcing calculator pages publicly.

Last updated: Sprint 17 (2026-06-16)

## Calculator route checklist

- [ ] All 8 live calculator routes exist under `src/app/calculators/*/page.tsx`
- [ ] Registry slugs in `src/config/calculators.ts` match `engineId` and route paths
- [ ] Only `status: 'ready'` calculators appear in header nav (`src/config/site-navigation.ts`)
- [ ] Planned calculators (SEP IRA, Solo 401(k)) are **not** linked as live tools
- [ ] `npm run build` lists all 8 calculator routes as static pages
- [ ] `src/app/sitemap.ts` includes only `getReadyCalculators()` entries (no planned routes)
- [ ] Internal calculator links use `buildReadyCalculatorNavLinks()` (filters to `ready` status)
- [ ] No JSON-LD or canonical URLs point to unpublished `/calculators/*` routes

### Live routes

| Route | Registry slug |
|-------|---------------|
| `/calculators/self-employed-tax` | `self-employed-tax-calculator` |
| `/calculators/1099-tax` | `1099-tax-calculator` |
| `/calculators/quarterly-tax` | `quarterly-tax-calculator` |
| `/calculators/estimated-tax` | `estimated-tax-calculator` |
| `/calculators/w2-vs-1099` | `w2-vs-1099-calculator` |
| `/calculators/s-corp-tax` | `s-corp-tax-calculator` |
| `/calculators/llc-vs-scorp` | `llc-vs-scorp-calculator` |
| `/calculators/hsa-tax` | `hsa-tax-savings-calculator` |

## SEO checklist

For each calculator page:

- [ ] Unique `<title>` from `buildCalculatorMetadata(calculator)`
- [ ] Unique meta description from registry `description`
- [ ] Canonical URL matches `calculator.route` (via `alternates.canonical`)
- [ ] Open Graph `url` matches canonical
- [ ] Twitter card: `summary_large_image`
- [ ] `robots.index` is `true` for ready calculators (`status !== 'ready'` → noindex)
- [ ] Primary keyword + secondary keywords present in metadata
- [ ] OG image path: `/og/calculators/{engineId}.png`

## Schema checklist

Each calculator page should render JSON-LD via `<JsonLd>`:

- [ ] `BreadcrumbList` — Home → calculator title (no broken `/calculators` hub URL until hub page exists)
- [ ] `SoftwareApplication` — name, url, description, offers (free), publisher, disclaimer
- [ ] `FAQPage` — all FAQ items from page content module; `buildFaqSchema` returns `null` only when FAQ list is empty
- [ ] No `undefined` or `null` fields in serialized JSON-LD
- [ ] Schema copy avoids tax advice claims (use “estimate”, “based on your inputs”, “may”)

## Copy safety checklist

Search page content (`src/lib/calculators/*-page.ts`) and UI labels for risky phrasing:

| Avoid | Prefer |
|-------|--------|
| you should | based on your inputs / may |
| we recommend | compare / estimate |
| best option | higher estimated value |
| choose S Corp / choose LLC | compare structures / review with a tax professional |
| tax advice (as a claim) | not tax advice / estimates only |
| guaranteed | may / estimated |
| accurate tax bill | estimated federal tax |

- [ ] Primary result labels use UI overrides where engine labels say “Recommended” (payment planning cards)
- [ ] Comparison calculators label “Higher estimated value”, not “best option”
- [ ] Entity calculators disclaim election / formation advice prominently

## Internal linking checklist

- [ ] Each calculator links to **3–5** other **ready** calculators via `RelatedCalculatorsBlock`
- [ ] Related guide links use `buildRelatedGuideLinks()` with **Coming soon** badge for `status !== 'publishable'`
- [ ] Unpublished resource pages are not clickable links unless labeled Coming soon
- [ ] Footer resource links (`/methodology`, `/guides`, etc.) are acceptable sitewide placeholders — verify before launch if those pages do not exist

## UX consistency checklist

Across all 8 calculator pages:

- [ ] `CalculatorShell` with `className="pb-8"` hero spacing
- [ ] Trust indicators: `CheckCircle2Icon` list with `mb-4 flex flex-wrap gap-x-5 gap-y-2`
- [ ] Two-column layout: inputs left, `PrimaryResults` right (`lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]`)
- [ ] `BreakdownResults` collapsed below inputs/results
- [ ] `WarningPanel` → `DisclaimerPanel` → privacy `InfoCallout` order
- [ ] `FaqBlock` with `defaultOpenIndexes={[0, 1]}`
- [ ] Methodology + worked examples + FAQ + IRS sources + related blocks in lower section
- [ ] `PageContainer width="calculator"` with `space-y-12`

## Legal / disclaimer checklist

- [ ] Engine `disclaimer` text rendered via `DisclaimerPanel` on every calculator
- [ ] Site disclaimer in `src/config/site.ts` referenced in methodology footers
- [ ] Footer includes “Estimates only — not tax advice”
- [ ] Entity calculators include compensation / structure disclaimers in calculator UI
- [ ] HSA calculator notes eligibility is not verified

## Build / test checklist

```bash
npm run typecheck
npm run test
npm run build
```

- [ ] Typecheck passes with no errors
- [ ] Tax engine tests pass (86+ tests; do not change formulas without review)
- [ ] Production build succeeds; all 8 calculator routes appear in build output
- [ ] Spot-check one calculator in browser: inputs update results, no console errors

## Pre-homepage gaps (known)

- `/calculators` hub page does not exist (breadcrumb schema uses Home → page only)
- Resource pages in registry are `planned` — shown as Coming soon on calculator pages
- Homepage (`/`) is not built in Sprint 17
