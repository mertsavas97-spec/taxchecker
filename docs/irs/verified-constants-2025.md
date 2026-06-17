# Verified Tax Constants — Tax Year 2025

This document records **IRS-verified numeric constants** for taxable year **2025** (returns typically filed in 2026). Each value cites a primary official source. Use this file as the authoritative input spec for `config/tax-year-2025.ts` when implementation begins.

**Verification gate:** Constants marked ✅ are verified. See `docs/irs/verification-gaps.md` for unresolved items.

**Tax year scope:** Calendar year 2025 / taxable year beginning in 2025  
**Document assembled:** 2026-06-16  
**Verifier:** TaxChecker documentation sprint (primary-source review)

---

## Summary Table

| Category | Constants verified | Primary source |
|---|---|---|
| Federal income tax brackets | ✅ All 5 filing statuses | Rev. Proc. 2024-40; IRS.gov brackets page |
| Standard deduction | ✅ All 5 filing statuses | Rev. Proc. 2024-40 |
| Self-employment tax rates | ✅ | Topic 554; Schedule SE (2025) |
| Social Security wage base (2025) | ✅ $176,100 | Schedule SE instructions (2025) |
| SE tax deductible portion | ✅ 50% | Topic 554 |
| Additional Medicare Tax | ✅ Rate + thresholds | IRS Additional Medicare Q&A; Topic 554 |
| W-2 FICA rates | ✅ | Publication 15; Schedule SE |
| Estimated tax safe harbors | ✅ | Form 1040-ES (2025); IRS estimated tax FAQs |
| Quarterly due dates (2025) | ✅ | Form 1040-ES (2025) |
| HSA limits | ✅ | Rev. Proc. 2024-25; Publication 969 (2025) |
| SEP IRA limits | ✅ | Notice 2024-80; Publication 560 (2025) |
| Solo 401(k) limits | ✅ | Notice 2024-80; Publication 560 (2025) |
| Annual compensation cap (401(a)(17)) | ✅ $350,000 | Notice 2024-80 |

---

## 1. Federal Income Tax Brackets (Tax Year 2025)

Ordinary income tax rates: **10%, 12%, 22%, 24%, 32%, 35%, 37%** (unchanged statutory rates).

Bracket boundaries below are **taxable income** thresholds. Engine should model brackets as: tax = base + rate × (income − bracket floor), with top bracket having no upper cap.

### Source

| Field | Value |
|---|---|
| **Source title** | Revenue Procedure 2024-40 |
| **Source URL** | https://www.irs.gov/pub/irs-drop/rp-24-40.pdf |
| **Supporting URL** | https://www.irs.gov/filing/federal-income-tax-rates-and-brackets |
| **News release** | IR-2024-273 — https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2025 |
| **Tax year** | 2025 |
| **Date accessed** | 2026-06-16 |
| **Notes** | Rev. Proc. issued 2024-10-22; OBBBA (P.L. 119-21, July 2025) made TCJA rate tables permanent but **2025** inflation adjustments remain those in Rev. Proc. 2024-40 per Rev. Proc. 2025-32 (2026 adjustments). Qualifying surviving spouse uses **same table as MFJ** (Rev. Proc. Table 1 caption: "Married Individuals Filing Joint Returns and Surviving Spouses"). |

### Single (`single`)

| Rate | Taxable income over | Up to |
|---|---|---|
| 10% | $0 | $11,925 |
| 12% | $11,925 | $48,475 |
| 22% | $48,475 | $103,350 |
| 24% | $103,350 | $197,300 |
| 32% | $197,300 | $250,525 |
| 35% | $250,525 | $626,350 |
| 37% | $626,350 | — |

### Married Filing Jointly (`married_filing_jointly`)

| Rate | Taxable income over | Up to |
|---|---|---|
| 10% | $0 | $23,850 |
| 12% | $23,850 | $96,950 |
| 22% | $96,950 | $206,700 |
| 24% | $206,700 | $394,600 |
| 32% | $394,600 | $501,050 |
| 35% | $501,050 | $751,600 |
| 37% | $751,600 | — |

### Qualifying Surviving Spouse (`qualifying_surviving_spouse`)

**Same brackets as married filing jointly** (Rev. Proc. 2024-40, Table 1).

### Married Filing Separately (`married_filing_separately`)

| Rate | Taxable income over | Up to |
|---|---|---|
| 10% | $0 | $11,925 |
| 12% | $11,925 | $48,475 |
| 22% | $48,475 | $103,350 |
| 24% | $103,350 | $197,300 |
| 32% | $197,300 | $250,525 |
| 35% | $250,525 | $375,800 |
| 37% | $375,800 | — |

**Note:** MFS top bracket begins at **$375,800**, not $626,350.

### Head of Household (`head_of_household`)

| Rate | Taxable income over | Up to |
|---|---|---|
| 10% | $0 | $17,000 |
| 12% | $17,000 | $64,850 |
| 22% | $64,850 | $103,350 |
| 24% | $103,350 | $197,300 |
| 32% | $197,300 | $250,500 |
| 35% | $250,500 | $626,350 |
| 37% | $626,350 | — |

### Rev. Proc. cumulative tax formulas (audit reference)

MFJ example (Table 1): over $751,600 → $202,154.50 + 37% of excess over $751,600.  
Single (Table 3): over $626,350 → $188,769.75 + 37% of excess over $626,350.  
MFS (Table 4): over $375,800 → $101,077.25 + 37% of excess over $375,800.

---

## 2. Standard Deduction (Tax Year 2025)

| Filing status | Amount |
|---|---|
| Married filing jointly | **$30,000** |
| Qualifying surviving spouse | **$30,000** (same as MFJ) |
| Head of household | **$22,500** |
| Single | **$15,000** |
| Married filing separately | **$15,000** |

| Field | Value |
|---|---|
| **Source title** | Revenue Procedure 2024-40, Section 2.15 |
| **Source URL** | https://www.irs.gov/pub/irs-drop/rp-24-40.pdf |
| **Tax year** | 2025 |
| **Date accessed** | 2026-06-16 |
| **Notes** | Additional standard deduction for age 65+/blind: $1,600 ($2,000 unmarried) — **out of TaxChecker 1.0 scope** but documented in Rev. Proc. Dependent standard deduction rules also out of 1.0 scope. |

---

## 3. Self-Employment Tax

### Combined rate

| Constant | Value |
|---|---|
| Total SE tax rate | **15.3%** |
| Social Security portion (combined employer+employee) | **12.4%** |
| Medicare portion (combined employer+employee) | **2.9%** |

| Field | Value |
|---|---|
| **Source title** | Topic no. 554, Self-employment tax |
| **Source URL** | https://www.irs.gov/taxtopics/tc554 |
| **Supporting** | https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes |
| **Form reference** | Schedule SE (2025) — lines 10 (12.4%) and 11 (2.9%) |
| **Tax year** | 2025 |
| **Date accessed** | 2026-06-16 |
| **Notes** | Rates are statutory; Schedule SE applies 12.4% only to net earnings up to remaining SS wage base after W-2 wages. |

### Net earnings factor

| Constant | Value |
|---|---|
| Net earnings multiplier | **92.35%** (0.9235) |

| Field | Value |
|---|---|
| **Source title** | Topic no. 554, Self-employment tax |
| **Source URL** | https://www.irs.gov/taxtopics/tc554 |
| **Tax year** | 2025 |
| **Date accessed** | 2026-06-16 |
| **Notes** | "Generally, the amount subject to self-employment tax is 92.35% of your net earnings from self-employment." Schedule SE line 4 applies this factor. |

### Social Security wage base (2025)

| Constant | Value |
|---|---|
| Maximum combined wages + SE earnings subject to SS tax | **$176,100** |

| Field | Value |
|---|---|
| **Source title** | Instructions for Schedule SE (Form 1040) (2025) |
| **Source URL** | https://www.irs.gov/instructions/i1040sse |
| **PDF URL** | https://www.irs.gov/pub/irs-pdf/i1040sse.pdf |
| **Form line** | Schedule SE (2025), line 7 |
| **Tax year** | 2025 |
| **Date accessed** | 2026-06-16 |
| **Notes** | Applies to combined W-2 wages and net SE earnings for SS portion. IRS COLA table corroborates: https://www.irs.gov/retirement-plans/cola-increases-for-dollar-limitations-on-benefits-and-contributions |

### Deductible portion of SE tax

| Constant | Value |
|---|---|
| AGI deduction rate | **50%** (one-half of SE tax) |

| Field | Value |
|---|---|
| **Source title** | Topic no. 554, Self-employment tax — Reporting |
| **Source URL** | https://www.irs.gov/taxtopics/tc554 |
| **Tax year** | 2025 |
| **Date accessed** | 2026-06-16 |
| **Notes** | Deducted on Schedule 1 (Form 1040); calculated on Schedule SE. |

### Minimum net earnings threshold (informational)

| Constant | Value |
|---|---|
| SE tax filing threshold | **$400** net earnings |

| Field | Value |
|---|---|
| **Source** | Instructions for Schedule SE (2025) |
| **Notes** | Below $400 net earnings, no SE tax generally due. Engine should return $0 SE tax, not error. |

---

## 4. Additional Medicare Tax

| Constant | Value |
|---|---|
| Rate | **0.9%** (0.009) |

### Thresholds by filing status

| Filing status | Threshold |
|---|---|
| Married filing jointly | **$250,000** |
| Married filing separately | **$125,000** |
| Single | **$200,000** |
| Head of household | **$200,000** |
| Qualifying surviving spouse | **$200,000** |

| Field | Value |
|---|---|
| **Source title** | Questions and Answers for the Additional Medicare Tax |
| **Source URL** | https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax |
| **Supporting** | Topic no. 554; Publication 505 (2026) Additional Medicare section |
| **Tax year** | 2025 (thresholds are **not** inflation-adjusted) |
| **Date accessed** | 2026-06-16 |
| **Notes** | QSS threshold follows IRS Q&A table ($200,000 for qualifying widow(er) with dependent child). W-2 **withholding** threshold for employers is **$200,000** regardless of filing status (separate rule). Engine must coordinate W-2 + SE income per Form 8959 logic — see verification-gaps.md. |

---

## 5. W-2 Payroll Tax (FICA) — 2025

| Constant | Value |
|---|---|
| Employee Social Security rate | **6.2%** |
| Employer Social Security rate | **6.2%** |
| Employee Medicare rate | **1.45%** |
| Employer Medicare rate | **1.45%** |
| Social Security wage base | **$176,100** |
| Medicare wage base | **No limit** |

| Field | Value |
|---|---|
| **Source title** | Publication 15 (Circular E), Employer’s Tax Guide — Section 15 |
| **Source URL** | https://www.irs.gov/publications/p15 |
| **Supporting** | Schedule SE (2025) line 7; COLA limitations page |
| **Tax year** | 2025 |
| **Date accessed** | 2026-06-16 |
| **Notes** | Current Pub. 15 edition on IRS.gov is labeled for **2026** and states SS rate 6.2% and Medicare 1.45% are **unchanged from 2025**; 2025 wage base confirmed via Schedule SE ($176,100). Employee + employer combined = 12.4% SS + 2.9% Medicare on wages. |

---

## 6. Estimated Tax — Safe Harbor Rules (2025)

Applies to **2025** estimated tax payments (Form 1040-ES for tax year 2025).

### Who must pay (general rule)

| Rule | Value |
|---|---|
| Minimum expected tax after withholding/credits | **$1,000** |

### Safe harbor percentages

| Rule | Rate |
|---|---|
| Current-year safe harbor | **90%** of current year tax |
| Prior-year safe harbor | **100%** of prior year tax |
| Prior-year safe harbor (high income) | **110%** of prior year tax |

### High-income AGI threshold (for 110% rule)

| Filing status | Prior-year AGI threshold |
|---|---|
| Most statuses | **$150,000** |
| Married filing separately | **$75,000** |

**Important:** For **2025** estimated payments, Form 1040-ES uses **2024** prior-year AGI to determine whether the 110% rule applies.

| Field | Value |
|---|---|
| **Source title** | Form 1040-ES (2025) |
| **Source URL** | https://www.irs.gov/pub/irs-prior/f1040es--2025.pdf |
| **Supporting** | https://www.irs.gov/faqs/estimated-tax/individuals/individuals |
| **Supporting** | https://www.irs.gov/payments/underpayment-of-estimated-tax-by-individuals-penalty |
| **Tax year** | 2025 (payments); prior-year AGI reference year **2024** |
| **Date accessed** | 2026-06-16 |
| **Notes** | Percentages are statutory. Farming/fishing 66⅔% rule excluded from TaxChecker 1.0. Underpayment penalty (Form 2210) excluded from 1.0. |

---

## 7. Quarterly Estimated Tax Due Dates (Calendar Year 2025)

Payments for **tax year 2025** income:

| Quarter | Period | Due date |
|---|---|---|
| Q1 | Jan 1 – Mar 31, 2025 | **April 15, 2025** |
| Q2 | Apr 1 – May 31, 2025 | **June 16, 2025** |
| Q3 | Jun 1 – Aug 31, 2025 | **September 15, 2025** |
| Q4 | Sep 1 – Dec 31, 2025 | **January 15, 2026** |

| Field | Value |
|---|---|
| **Source title** | Form 1040-ES (2025), Payment Due Dates |
| **Source URL** | https://www.irs.gov/pub/irs-prior/f1040es--2025.pdf |
| **Supporting** | https://www.irs.gov/faqs/estimated-tax/individuals/individuals-2 |
| **Tax year** | 2025 |
| **Date accessed** | 2026-06-16 |
| **Notes** | Q2 due **June 16** because June 15, 2025 was a Sunday. Weekend/holiday rule: pay next business day. Q4 may be skipped if 2025 return filed by **February 2, 2026** with full balance paid (per Form 1040-ES footnote). |

---

## 8. HSA Contribution Limits (Calendar Year 2025)

| Constant | Value |
|---|---|
| Self-only coverage limit | **$4,300** |
| Family coverage limit | **$8,550** |
| Catch-up contribution (age 55+) | **$1,000** |
| Catch-up eligibility age | **55** (at end of tax year) |

| Field | Value |
|---|---|
| **Source title** | Revenue Procedure 2024-25 |
| **Source URL** | https://www.irs.gov/pub/irs-drop/rp-24-25.pdf |
| **Supporting** | Publication 969 (2025) — https://www.irs.gov/publications/p969 |
| **Supporting** | Instructions for Form 8889 (2025) — https://www.irs.gov/instructions/i8889 |
| **Tax year** | 2025 |
| **Date accessed** | 2026-06-16 |
| **Notes** | Limits reduced by employer HSA contributions. Partial-year eligibility proration uses Form 8889 worksheet — not a single constant (see verification-gaps.md). HDHP minimum deductibles ($1,650 / $3,300) are eligibility rules, not contribution limits. |

---

## 9. SEP IRA (Tax Year 2025)

| Constant | Value |
|---|---|
| Maximum contribution (§415(c)) | **$70,000** |
| Maximum % of compensation | **25%** |
| Elective deferrals permitted | **No** (standard SEP) |

| Field | Value |
|---|---|
| **Source title** | Notice 2024-80 — 2025 Amounts Relating to Retirement Plans |
| **Source URL** | https://www.irs.gov/pub/irs-drop/n-24-80.pdf |
| **Supporting** | Publication 560 (2025) — Table 1-1 — https://www.irs.gov/publications/p560 |
| **Supporting** | SEP contribution limits — https://www.irs.gov/retirement-plans/plan-participant-employee/sep-contribution-limits-including-grandfathered-sarseps |
| **Tax year** | 2025 |
| **Date accessed** | 2026-06-16 |
| **Notes** | Limit is lesser of 25% of compensation or $70,000. Self-employed compensation uses Pub 560 worksheet (circular calculation) — see verification-gaps.md. |

---

## 10. Solo 401(k) / One-Participant 401(k) (Tax Year 2025)

| Constant | Value |
|---|---|
| Employee elective deferral limit (§402(g)) | **$23,500** |
| Catch-up contribution (age 50+, §414(v)) | **$7,500** |
| Catch-up eligibility age | **50** (end of calendar year) |
| Defined contribution annual additions limit (§415(c)) | **$70,000** |
| Employer profit-sharing maximum % | **25%** of compensation |
| Annual compensation limit (§401(a)(17)) | **$350,000** |

### SECURE 2.0 enhanced catch-up (ages 60–63) — documented, not 1.0 default

| Constant | Value |
|---|---|
| Enhanced catch-up (§414(v)(2)(E)) | **$11,250** |

| Field | Value |
|---|---|
| **Source title** | Notice 2024-80 |
| **Source URL** | https://www.irs.gov/pub/irs-drop/n-24-80.pdf |
| **Supporting** | Publication 560 (2025); https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits |
| **News release** | IR-2024-285 — https://www.irs.gov/newsroom/401k-limit-increases-to-23500-for-2025-ira-limit-remains-7000 |
| **Tax year** | 2025 |
| **Date accessed** | 2026-06-16 |
| **Notes** | Total additions = employee deferral + employer contributions, capped at $70,000 (before catch-up). Catch-up is **in addition** to §415(c) limit per Pub 560. Age 60–63 enhanced catch-up deferred to TaxChecker v1.1 unless product scope expands. |

---

## 11. Engine Config Mapping

Suggested `TaxYearConfig` values (cents where monetary):

```typescript
// Reference only — implementation in Sprint 2
{
  year: 2025,
  verifiedAt: '2026-06-16',
  sourceNotes: 'docs/irs/verified-constants-2025.md',

  // monetary values as integer cents in implementation
  standardDeduction: {
    married_filing_jointly: 3_000_000,
    qualifying_surviving_spouse: 3_000_000,
    head_of_household: 2_250_000,
    single: 1_500_000,
    married_filing_separately: 1_500_000,
  },

  selfEmploymentTax: {
    netEarningsFactor: 0.9235,
    socialSecurityRate: 0.124,      // combined SS on Schedule SE
    medicareRate: 0.029,
    socialSecurityWageBase: 17_610_000, // cents
    deductiblePortionRate: 0.5,
  },

  additionalMedicareTax: {
    rate: 0.009,
    thresholds: { /* see section 4 */ },
  },

  payrollTax: {
    socialSecurityRateEmployee: 0.062,
    medicareRateEmployee: 0.0145,
    socialSecurityRateEmployer: 0.062,
    medicareRateEmployer: 0.0145,
    socialSecurityWageBase: 17_610_000,
  },

  estimatedTax: {
    safeHarborCurrentYearRate: 0.9,
    safeHarborPriorYearRate: 1.0,
    safeHarborPriorYearHighAGIRate: 1.1,
    safeHarborHighAGIThreshold: 15_000_000,      // $150,000
    safeHarborHighAGIThresholdMFS: 7_500_000,    // $75,000
    minimumTaxOwedThreshold: 1_000_00,           // $1,000
    quarterlyDueDates: ['2025-04-15', '2025-06-16', '2025-09-15', '2026-01-15'],
  },

  hsa: {
    selfOnlyLimit: 430_000,
    familyLimit: 855_000,
    catchUpAge: 55,
    catchUpAmount: 100_000,
  },

  sepIra: {
    maxContribution: 7_000_000,
    compensationRate: 0.25,
  },

  solo401k: {
    employeeDeferralLimit: 2_350_000,
    catchUpAge: 50,
    catchUpAmount: 750_000,
    enhancedCatchUpAgeMin: 60,       // SECURE 2.0 — v1.1
    enhancedCatchUpAmount: 1_125_000,  // SECURE 2.0 — v1.1
    totalAnnualAdditionLimit: 7_000_000,
    employerCompensationRate: 0.25,
    annualCompensationLimit: 35_000_000,
  },
}
```

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-16 | Initial verification pass for tax year 2025 |
