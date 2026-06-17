# IRS Verification Gaps — Tax Year 2025

Items that **could not be verified as a single deployable constant**, require **algorithmic implementation** beyond constants, or are **explicitly out of TaxChecker 1.0 scope**. Do not hard-code guesses for these — resolve in implementation sprints or product decisions.

**Last updated:** 2026-06-16

---

## Status Key

| Status | Meaning |
|---|---|
| 🔶 Algorithm | Official rules exist but require worksheet/logic, not one number |
| 🔷 Scope | Intentionally excluded from TaxChecker 1.0 |
| ⚠️ Source chain | Constant likely correct but primary 2025-specific edition not directly fetched |
| 📋 Product | Awaiting product/engine decision |

---

## Open Gaps

### 1. Self-employed SEP / Solo 401(k) compensation worksheet 🔶

| Item | Self-employed plan compensation (Pub 560) |
|---|---|
| **Why unresolved** | Contribution limit depends on net earnings **minus** deductible SE tax **minus** contribution itself (circular). Pub 560 provides a rate table / worksheet, not one constant. |
| **Official source** | Publication 560 (2025), Chapter 5 — https://www.irs.gov/publications/p560 |
| **Engine action** | Implement algebraic solution or IRS rate table from Pub 560; golden-file test against worksheet example. |
| **Blocks** | SEP IRA calculator, Solo 401(k) calculator accuracy |

---

### 2. Additional Medicare Tax — W-2 + SE coordination 🔶

| Item | Combined wage and SE income threshold reduction |
|---|---|
| **Why unresolved** | Threshold applies to combined income; SE portion uses reduced threshold after W-2 wages (Form 8959). Not expressible as flat constants alone. |
| **Official source** | Form 8959; Additional Medicare Q&A — https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax |
| **Engine action** | Implement Form 8959 Steps 1–3 logic in `core/self-employment-tax.ts` / `core/payroll-tax.ts`. |
| **Blocks** | High earners with both W-2 and 1099 income |

---

### 3. HSA partial-year / mid-year coverage proration 🔶

| Item | Monthly limitation when not HDHP-eligible all year |
|---|---|
| **Why unresolved** | Requires Form 8889 Line 3 Limitation Chart and Worksheet; depends on months eligible. |
| **Official source** | Instructions for Form 8889 (2025) — https://www.irs.gov/instructions/i8889 |
| **Engine action** | Implement `monthsEligible` input with IRS worksheet or simplified proration with documented tolerance. |
| **Blocks** | HSA calculator for partial-year enrollees |

---

### 4. SECURE 2.0 age 60–63 enhanced 401(k) catch-up 📋 🔷

| Item | $11,250 catch-up for ages 60–63 (2025) |
|---|---|
| **Verified constant?** | Yes — Notice 2024-80 |
| **Gap** | TaxChecker 1.0 specs default to age **50** / $7,500 catch-up only. Enhanced catch-up not in initial engine scope. |
| **Official source** | Notice 2024-80 — https://www.irs.gov/pub/irs-drop/n-24-80.pdf |
| **Engine action** | Add in v1.1 if product includes age 60–63 path. |

---

### 5. HDHP eligibility minimum deductibles (HSA) 🔷

| Item | 2025 HDHP minimum deductible ($1,650 self-only / $3,300 family) |
|---|---|
| **Verified constant?** | Yes — Rev. Proc. 2024-25 |
| **Gap** | Eligibility rule, not a tax calculation constant. TaxChecker does not verify plan qualifies as HDHP. |
| **Official source** | Rev. Proc. 2024-25 — https://www.irs.gov/pub/irs-drop/rp-24-25.pdf |
| **Engine action** | Display as reference text only; user attestation checkbox in UI sprint. |

---

### 6. Publication 15 (2025)-specific PDF not used for FICA ⚠️

| Item | 2025 FICA rate confirmation |
|---|---|
| **Why flagged** | IRS.gov currently serves Publication 15 labeled for **2026**; 2025 rates confirmed via "unchanged from 2025" language plus Schedule SE wage base. |
| **Constants affected** | 6.2% SS, 1.45% Medicare (statutory — low risk) |
| **Mitigation** | Rates are statutory (IRC §§ 3101, 3111). Wage base verified from Schedule SE 2025. |
| **Engine action** | Optional: archive `p15--2025.pdf` from IRS prior publications when implementing. |

---

### 7. Estimated tax — farming/fishing 66⅔% rule 🔷

| Item | Reduced safe harbor for farmers/fishers |
|---|---|
| **Official source** | Form 1040-ES (2025); Publication 505 |
| **Gap** | Excluded from TaxChecker 1.0 calculator specs. |
| **Engine action** | None for 1.0. |

---

### 8. Form 2210 underpayment penalty 🔷

| Item | Dollar penalty for underpaid estimated tax |
|---|---|
| **Gap** | Excluded from 1.0; engine may set `underpaymentRisk` flag only. |
| **Official source** | Form 2210 — https://www.irs.gov/forms-pubs/about-form-2210 |

---

### 9. QBI deduction (Section 199A) 🔷

| Item | 20% qualified business income deduction |
|---|---|
| **Gap** | Explicitly excluded from all 1.0 calculators. |
| **Official source** | Form 8995 / Publication 535 |

---

### 10. OBBBA mid-year legislative monitoring ⚠️

| Item | 2025 tax year constant stability after P.L. 119-21 (July 2025) |
|---|---|
| **Why flagged** | Rev. Proc. 2024-40 warns that post-Oct-2024 legislation may affect adjustments. OBBBA made TCJA brackets permanent; Rev. Proc. 2025-32 modifies **2026** items, not 2025. |
| **Risk** | Low for 2025 TY brackets/deductions already in effect. Monitor IRS newsroom for corrective guidance. |
| **Engine action** | Pin `verifiedAt` date; re-verify before each filing season release. |

---

### 11. Qualifying surviving spouse vs MFJ standard deduction ⚠️

| Item | QSS uses MFJ brackets |
|---|---|
| **Status** | Verified via Rev. Proc. 2024-40 Table 1 caption. |
| **Residual risk** | Eligibility for QSS status is factual (dependents, timing) — engine accepts user-selected filing status; does not validate QSS eligibility. |

---

### 12. Employer HSA contributions reduce employee limit 🔶

| Item | Net HSA limit after employer contributions |
|---|---|
| **Official source** | Publication 969 (2025); Form 8889 |
| **Gap** | 1.0 HSA spec lists employer contributions as optional v1.1 input. |
| **Engine action** | Add `employerHsaContribution` input in implementation sprint. |

---

## Resolved in `verified-constants-2025.md` (formerly TODO)

The following were marked `TODO_VERIFY_WITH_CURRENT_IRS_SOURCE` in Sprint 0 and are **now verified** for 2025:

- Federal income tax brackets (all filing statuses)
- Standard deduction amounts
- SE tax rates (15.3% = 12.4% + 2.9%)
- Net earnings factor (92.35%)
- Social Security wage base ($176,100)
- SE tax deductible portion (50%)
- Additional Medicare rate (0.9%) and thresholds
- W-2 FICA rates and wage base
- Estimated tax safe harbor rates (90% / 100% / 110%) and AGI thresholds ($150k / $75k MFS)
- Quarterly due dates for 2025
- HSA limits and catch-up ($4,300 / $8,550 / $1,000 at age 55+)
- SEP IRA max ($70,000) and 25% rate
- Solo 401(k) deferral ($23,500), catch-up ($7,500 at 50+), §415(c) limit ($70,000), compensation cap ($350,000)

---

## Pre-Implementation Checklist

Before merging `tax-year-2025.ts`:

- [ ] All keys in `TaxYearConfig` map to a row in `verified-constants-2025.md` or an entry in this gaps doc
- [ ] No calculator ships with a required constant listed as 🔶 without implemented worksheet logic
- [ ] Golden-file tests cite source URL + tax year
- [ ] Re-run verification if IRS publishes superseding guidance

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-16 | Initial gaps document after 2025 verification pass |
