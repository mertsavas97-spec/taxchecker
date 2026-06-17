# IRS & Public Source Registry — TaxChecker 1.0

This document catalogs the authoritative public sources required to implement TaxChecker 1.0 calculators. All tax constants loaded into `TaxYearConfig` must trace to an entry in this registry.

**Verification policy:** No numeric tax constant ships to production until it is verified against the linked primary source for the target tax year. Unverified values must use the sentinel `TODO_VERIFY_WITH_CURRENT_IRS_SOURCE` in code and config.

**Last reviewed:** 2026-06-16  
**Default tax year for 1.0:** **2025** (verified — see `docs/irs/verified-constants-2025.md`)  
**Verification gaps:** `docs/irs/verification-gaps.md`

---

## Verified Constants Registry

| Tax year | Document | Status |
|---|---|---|
| 2025 | [verified-constants-2025.md](./verified-constants-2025.md) | ✅ Primary constants verified 2026-06-16 |
| 2026 | — | Not started |

---

## Source Authority Hierarchy

1. **Primary (binding for constants):** IRS forms, instructions, publications, Revenue Procedures, and IRS.gov topic pages dated for the tax year.
2. **Secondary (interpretive only):** IRS FAQs, IRS news releases — use for UX copy and edge-case notes, not for numeric constants unless they explicitly restate a primary source.
3. **Excluded:** Third-party tax blogs, CPA marketing pages, and AI-generated summaries — never used as constant sources.

---

## Federal Income Tax Brackets

| Field | Value |
|---|---|
| **Purpose** | Ordinary income tax on taxable income after deductions |
| **Used by** | Self Employed, 1099, Quarterly, Estimated Tax, W2 vs 1099, S Corp, LLC vs S Corp, HSA, SEP IRA, Solo 401(k) |
| **Primary source** | [Revenue Procedure 2024-40 (PDF)](https://www.irs.gov/pub/irs-drop/rp-24-40.pdf) |
| **News release** | [IR-2024-273 — Tax year 2025 inflation adjustments](https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2025) |
| **Supporting** | [Federal income tax rates and brackets (IRS.gov)](https://www.irs.gov/filing/federal-income-tax-rates-and-brackets) |
| **Constants needed** | Bracket thresholds and rates per `FilingStatus` for target tax year |
| **Verification status** | ✅ Verified for 2025 — see `verified-constants-2025.md` §1 |

### Required config keys

```
federalIncomeTax.brackets[FilingStatus][] → { min, max, rate }
federalIncomeTax.brackets[FilingStatus].length → 7 (typical; verify annually)
```

---

## Standard Deduction

| Field | Value |
|---|---|
| **Purpose** | Default deduction when user does not itemize |
| **Used by** | All income-tax calculators |
| **Primary source** | Same Rev. Proc. as brackets |
| **Supporting** | [Publication 501 — Dependents, Standard Deduction, Filing Information](https://www.irs.gov/publications/p501) |
| **Constants needed** | `standardDeduction[FilingStatus]`, additional standard deduction for age 65+/blind (v2; document now, implement if in scope) |
| **Verification status** | ✅ Verified for 2025 — Rev. Proc. 2024-40 §2.15 |

---

## Self-Employment Tax

| Field | Value |
|---|---|
| **Purpose** | Social Security and Medicare tax on net self-employment earnings |
| **Used by** | Self Employed, 1099, Quarterly, Estimated Tax, W2 vs 1099, S Corp (comparison baseline), LLC vs S Corp |
| **Primary source** | [Schedule SE (Form 1040)](https://www.irs.gov/forms-pubs/about-schedule-se-form-1040) and [Instructions for Schedule SE](https://www.irs.gov/instructions/i1040sse) |
| **Supporting** | [Publication 334 — Tax Guide for Small Business](https://www.irs.gov/publications/p334) |
| **Constants needed** | SE tax rate (combined), Social Security portion rate, Medicare portion rate, net earnings factor (92.35%), Social Security wage base, Additional Medicare threshold(s) by filing status, deductible portion (50% of SE tax) |
| **Verification status** | ✅ Verified for 2025 — see `verified-constants-2025.md` §3–§4 |

### Key formulas (from Schedule SE — 2025 verified)

- Net earnings from self-employment = net profit × 0.9235
- SE tax = (Social Security portion on earnings up to wage base) + (Medicare portion on all net SE earnings) + (Additional Medicare if applicable)
- 2025 SS wage base: **$176,100**

---

## Form SE (Schedule SE)

| Field | Value |
|---|---|
| **Document** | Schedule SE (Form 1040), Self-Employment Tax |
| **URL** | https://www.irs.gov/forms-pubs/about-schedule-se-form-1040 |
| **Instructions** | https://www.irs.gov/instructions/i1040sse |
| **Purpose** | Authoritative worksheet for SE tax computation and the 50% SE tax deduction |
| **Engine module** | `core/self-employment-tax.ts` |

---

## Publication 505 — Tax Withholding and Estimated Tax

| Field | Value |
|---|---|
| **Document** | Publication 505 |
| **URL** | https://www.irs.gov/publications/p505 |
| **Purpose** | Estimated tax rules, safe harbors, annualization, who must pay estimated tax |
| **Used by** | Quarterly Tax, Estimated Tax, Self Employed, 1099 |
| **Key topics** | 90% current-year safe harbor, 100%/110% prior-year safe harbor, underpayment penalty framework (penalty calc deferred to v2) |
| **Verification status** | ✅ Safe harbor rates verified for 2025 via Form 1040-ES (2025); penalty calc deferred |

---

## Form 1040-ES — Estimated Tax for Individuals

| Field | Value |
|---|---|
| **Document** | Form 1040-ES |
| **URL** | https://www.irs.gov/forms-pubs/about-form-1040-es |
| **PDF (2025)** | https://www.irs.gov/pub/irs-prior/f1040es--2025.pdf |
| **Purpose** | Quarterly payment voucher amounts and due dates |
| **Used by** | Quarterly Tax, Estimated Tax |
| **Constants needed** | Quarterly due dates for tax year (2025: Apr 15, Jun 16, Sep 15, Jan 15 2026) |
| **Verification status** | ✅ Verified for 2025 — see `verified-constants-2025.md` §7 |

---

## W-2 Payroll Tax (FICA) — Comparison Baseline

| Field | Value |
|---|---|
| **Purpose** | Employee share of Social Security and Medicare for W2 vs 1099 comparison |
| **Primary source** | [Publication 15 (Circular E)](https://www.irs.gov/publications/p15) |
| **Supporting** | [Publication 15-T — Federal Income Tax Withholding Methods](https://www.irs.gov/publications/p15t) |
| **Constants needed** | Employee FICA rates, wage base, Additional Medicare employee threshold |
| **Verification status** | ✅ Verified for 2025 — see `verified-constants-2025.md` §5 |

---

## HSA Contribution Limits

| Field | Value |
|---|---|
| **Purpose** | Maximum HSA contributions and catch-up for age 55+ |
| **Primary source** | [Revenue Procedure 2024-25 (PDF)](https://www.irs.gov/pub/irs-drop/rp-24-25.pdf) |
| **Supporting** | [Publication 969 (2025)](https://www.irs.gov/publications/p969) |
| **Supporting** | [Instructions for Form 8889 (2025)](https://www.irs.gov/instructions/i8889) |
| **Constants needed** | `hsa.limit.selfOnly`, `hsa.limit.family`, `hsa.catchUpAge`, `hsa.catchUpAmount` |
| **Verification status** | ✅ Verified for 2025 — $4,300 / $8,550 / $1,000 catch-up at age 55+ |

### Eligibility assumptions (Pub 969)

- User must have HDHP coverage — calculator collects plan type; does not verify employer plan details.
- Contribution limit prorated for partial-year HDHP coverage — edge case documented in HSA calculator spec.

---

## SEP IRA Contribution Rules

| Field | Value |
|---|---|
| **Purpose** | Employer contribution limits for self-employed SEP plans |
| **Primary source** | [Publication 560 — Retirement Plans for Small Business](https://www.irs.gov/publications/p560) |
| **Supporting** | [Publication 590-A](https://www.irs.gov/publications/p590a) |
| **Supporting** | [Notice 2024-80 (PDF)](https://www.irs.gov/pub/irs-drop/n-24-80.pdf) |
| **Constants needed** | `sepIra.maxContribution`, `sepIra.compensationRate` (25% of compensation), definition of compensation for self-employed (Pub 560 worksheet — see verification-gaps.md) |
| **Verification status** | ✅ Limits verified for 2025 ($70,000 / 25%); compensation worksheet 🔶 algorithm gap |

---

## Solo 401(k) / One-Participant 401(k) Rules

| Field | Value |
|---|---|
| **Purpose** | Employee elective deferral + employer profit-sharing for owner-only businesses |
| **Primary source** | [Publication 560](https://www.irs.gov/publications/p560), [One-Participant 401(k) Plans](https://www.irs.gov/retirement-plans/one-participant-401k-plans) |
| **Supporting** | [Notice 2024-80 (PDF)](https://www.irs.gov/pub/irs-drop/n-24-80.pdf) |
| **News release** | [IR-2024-285 — 401(k) limit increases to $23,500 for 2025](https://www.irs.gov/newsroom/401k-limit-increases-to-23500-for-2025-ira-limit-remains-7000) |
| **COLA table** | [COLA increases for dollar limitations](https://www.irs.gov/retirement-plans/cola-increases-for-dollar-limitations-on-benefits-and-contributions) |
| **Constants needed** | `solo401k.employeeDeferralLimit`, `solo401k.catchUpAmount`, `solo401k.catchUpAge`, `solo401k.totalAnnualAdditionLimit` (415(c) limit), employer profit-sharing rate cap (25% of compensation), `annualCompensationLimit` (401(a)(17)) |
| **Verification status** | ✅ Limits verified for 2025 — see `verified-constants-2025.md` §10 |

---

## S Corporation — Reasonable Compensation & Payroll Tax

| Field | Value |
|---|---|
| **Purpose** | Model salary vs distribution split and associated payroll taxes |
| **Primary source** | [S Corporations](https://www.irs.gov/businesses/small-businesses-self-employed/s-corporations) |
| **Supporting** | [Publication 535 — Business Expenses](https://www.irs.gov/publications/p535), IRS S Corp reasonable compensation guidance (case law summaries on IRS.gov — interpretive only) |
| **Constants needed** | Same FICA rates as W-2; federal income tax brackets; no separate S Corp rate (pass-through) |
| **Verification status** | Reasonable compensation is **not** a fixed IRS constant — engine uses user-provided salary % or dollar amount with documented assumptions |

### Documented assumption (product-level)

TaxChecker does not determine "reasonable compensation." Users supply intended W-2 salary from the S Corp; the calculator shows tax impact of that assumption. UI must state this is not a legal or IRS compliance determination.

---

## LLC Taxation (Default Pass-Through)

| Field | Value |
|---|---|
| **Purpose** | Baseline sole-prop / single-member LLC taxed as disregarded entity |
| **Primary source** | [Single Member Limited Liability Companies](https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies) |
| **Supporting** | [Publication 3402](https://www.irs.gov/publications/p3402) |
| **Engine treatment** | LLC path = Schedule C net profit → SE tax → income tax (no entity-level tax) |

---

## Additional Medicare Tax (0.9%)

| Field | Value |
|---|---|
| **Purpose** | Additional Medicare on wages and SE income above threshold |
| **Primary source** | [Questions and Answers for the Additional Medicare Tax](https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax) |
| **Supporting** | [Topic no. 554](https://www.irs.gov/taxtopics/tc554) |
| **Constants needed** | Rate 0.9%; thresholds by filing status (not inflation-adjusted) |
| **Verification status** | ✅ Verified for 2025 — see `verified-constants-2025.md` §4 |

---

## Qualified Business Income (QBI) Deduction — Section 199A

| Field | Value |
|---|---|
| **Purpose** | Potential 20% QBI deduction for pass-through income |
| **Primary source** | [Publication 535](https://www.irs.gov/publications/p535), [Form 8995 / 8995-A](https://www.irs.gov/forms-pubs/about-form-8995) |
| **TaxChecker 1.0 scope** | **Excluded** from automatic calculation (see calculator Exclusions). Document as future enhancement. |
| **Verification status** | N/A for 1.0 |

---

## State Income Tax

| Field | Value |
|---|---|
| **TaxChecker 1.0 scope** | **Excluded** — federal only |
| **Future source strategy** | See `docs/tax-engine-architecture.md` — State Tax Extension |

---

## Source Verification Checklist (per tax year)

Before enabling a `TaxYearConfig` in production:

- [x] Download Rev. Proc. for 2025; extract brackets, standard deduction — **Rev. Proc. 2024-40**
- [x] Verify SE tax rates and wage base — **Schedule SE instructions 2025**
- [x] Verify 1040-ES quarterly due dates — **Form 1040-ES (2025)**
- [x] Verify 401(k)/SEP limits — **Notice 2024-80, Pub 560 (2025)**
- [x] Verify HSA limits — **Rev. Proc. 2024-25**
- [x] Verify FICA rates — **Pub 15 + Schedule SE**
- [ ] Record verification date in `config/tax-year-2025.ts` header comment (implementation sprint)
- [ ] Unit tests reference same source document version
- [ ] Resolve algorithm gaps in `verification-gaps.md` before retirement calculators ship

---

## Additional Primary Sources (2025 verification pass)

| Source | URL | Used for |
|---|---|---|
| Revenue Procedure 2024-40 | https://www.irs.gov/pub/irs-drop/rp-24-40.pdf | 2025 brackets, standard deduction |
| Revenue Procedure 2024-25 | https://www.irs.gov/pub/irs-drop/rp-24-25.pdf | 2025 HSA limits |
| Notice 2024-80 | https://www.irs.gov/pub/irs-drop/n-24-80.pdf | 2025 retirement plan limits |
| Form 1040-ES (2025) | https://www.irs.gov/pub/irs-prior/f1040es--2025.pdf | Quarterly due dates, safe harbors |
| Instructions for Schedule SE (2025) | https://www.irs.gov/instructions/i1040sse | SS wage base, SE tax worksheet |
| Topic no. 554 | https://www.irs.gov/taxtopics/tc554 | SE rates, 92.35%, 50% deduction |
| Additional Medicare Tax Q&A | https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax | 0.9% thresholds |
| IRS estimated tax FAQs | https://www.irs.gov/faqs/estimated-tax/individuals/individuals | Safe harbor rules |
| Federal income tax rates and brackets | https://www.irs.gov/filing/federal-income-tax-rates-and-brackets | Human-readable bracket tables |
| IR-2024-273 | https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2025 | News release cross-check |
| IR-2024-285 | https://www.irs.gov/newsroom/401k-limit-increases-to-23500-for-2025-ira-limit-remains-7000 | 401(k) deferral limit |

---

## Change Log

| Date | Author | Change |
|---|---|---|
| 2026-06-16 | TaxChecker architecture sprint | Initial source registry for 1.0 |
| 2026-06-16 | IRS verification sprint | 2025 constants verified; registry entries updated |
