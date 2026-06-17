# Self Employed Tax Calculator — Specification

**Calculator ID:** `self-employed-tax`  
**Route (future):** `/calculators/self-employed-tax`  
**Engine module:** `src/lib/tax-engine/calculators/self-employed-tax.ts`  
**TaxChecker version:** 1.0

---

## Purpose

Estimate total federal tax liability for a self-employed individual with net business profit, including self-employment tax (Social Security and Medicare) and federal income tax. Provides a clear breakdown of SE tax, the deductible portion of SE tax, standard deduction, taxable income, and estimated total tax.

This is the **anchor calculator** for the income/SE tax cluster — other calculators (1099, Quarterly, Estimated) reuse its core pipeline.

---

## Target User

- Freelancers, independent contractors, and sole proprietors filing Schedule C
- Side-gig earners with net self-employment profit
- Small business owners without an entity election (or LLC taxed as disregarded entity)
- Users asking: "How much tax will I owe on my self-employment income?"

---

## SEO Intent

| Element | Value |
|---|---|
| **Primary keyword** | self employed tax calculator |
| **Secondary keywords** | self employment tax calculator, freelance tax calculator, Schedule C tax estimate, how much tax on 1099 income |
| **Search intent** | Informational / transactional — user wants a numeric estimate before quarterly payments or year-end planning |
| **Title tag (future)** | Self Employed Tax Calculator — Estimate SE & Income Tax \| TaxChecker |
| **Meta description** | Estimate your self-employment tax and federal income tax based on net business profit. Free calculator using IRS Schedule SE rules. Not tax advice. |

---

## Required Inputs

| Field | Type | Description |
|---|---|---|
| `taxYear` | `number` | Tax year for calculation |
| `filingStatus` | `FilingStatus` | IRS filing status |
| `netBusinessProfit` | `Cents` | Net profit from self-employment (Schedule C line 31 equivalent) |

---

## Optional Inputs

| Field | Type | Default | Description |
|---|---|---|---|
| `w2Wages` | `Cents` | `0` | W-2 wages subject to Social Security (for wage base coordination) |
| `otherIncome` | `Cents` | `0` | Other ordinary income included in taxable income (interest, W-2 wages for income tax) |
| `otherAdjustments` | `Cents` | `0` | Above-the-line adjustments other than 50% SE tax deduction |
| `useStandardDeduction` | `boolean` | `true` | Use standard deduction; if false, user supplies itemized total (optional v1.1) |
| `itemizedDeductions` | `Cents` | `0` | Total itemized deductions if not using standard |

---

## Outputs

| Output | Type | Description |
|---|---|---|
| `netEarnings` | `Cents` | Net earnings from self-employment (profit × 0.9235) |
| `selfEmploymentTax` | `Cents` | Total SE tax |
| `deductibleSETax` | `Cents` | 50% of SE tax (AGI adjustment) |
| `adjustedGrossIncome` | `Cents` | AGI estimate |
| `taxableIncome` | `Cents` | After standard/itemized deduction |
| `federalIncomeTax` | `Cents` | Ordinary income tax |
| `totalFederalTax` | `Cents` | SE tax + income tax |
| `effectiveTaxRate` | `number` | totalFederalTax / netBusinessProfit |
| `marginalTaxRate` | `number` | Federal marginal rate on last dollar of taxable income |

---

## Result Cards

| Card ID | Label | Value source | Variant |
|---|---|---|---|
| `total-tax` | Estimated Total Federal Tax | `totalFederalTax` | `liability` |
| `se-tax` | Self-Employment Tax | `selfEmploymentTax` | `default` |
| `income-tax` | Federal Income Tax | `federalIncomeTax` | `default` |
| `net-earnings` | Net SE Earnings (Tax Base) | `netEarnings` | `informational` |
| `effective-rate` | Effective Tax Rate | `effectiveTaxRate` | `default` (percent) |

---

## Formula Dependencies

```
netEarnings = netBusinessProfit × netEarningsFactor          // core/self-employment-tax
seTax = computeSETax(netEarnings, w2Wages, filingStatus)     // Schedule SE
deductibleSETax = seTax × deductiblePortionRate              // 50%
agi = netBusinessProfit + otherIncome - deductibleSETax - otherAdjustments
taxableIncome = max(0, agi - deduction)
incomeTax = computeFederalIncomeTax(taxableIncome, filingStatus)
totalFederalTax = seTax + incomeTax
```

**Engine modules:** `self-employment-tax`, `deductions`, `federal-income-tax`

---

## IRS / Public References

- [Schedule SE (Form 1040)](https://www.irs.gov/forms-pubs/about-schedule-se-form-1040)
- [Instructions for Schedule SE](https://www.irs.gov/instructions/i1040sse)
- [Publication 334 — Tax Guide for Small Business](https://www.irs.gov/publications/p334)
- [Publication 505 — Estimated Tax](https://www.irs.gov/publications/p505) (for cross-link to quarterly)
- Federal brackets and standard deduction — Rev. Proc. (see `docs/irs/sources.md`)

---

## Assumptions

1. User provides **net** profit, not gross receipts (expenses already deducted).
2. Standard deduction used unless user opts into itemized.
3. No state or local taxes.
4. No Qualified Business Income (Section 199A) deduction.
5. No self-employment health insurance deduction, SEP/Solo 401(k) contributions, or HSA (unless added as optional inputs in future).
6. Single self-employment business; multiple Schedule C entities aggregated by user.
7. All constants from `TaxYearConfig` for selected year.

---

## Exclusions

- State income tax
- QBI deduction (Section 199A)
- Alternative Minimum Tax (AMT)
- Premium Tax Credit / ACA subsidies
- Self-employment health insurance deduction
- Retirement contribution deductions (see SEP / Solo 401k calculators)
- Underpayment penalties (see Quarterly / Estimated calculators)
- Net Investment Income Tax (NIIT)
- Child Tax Credit and other credits (except optional withholding offset in Estimated Tax calculator)

---

## Edge Cases

| Case | Handling |
|---|---|
| Zero or negative net profit | SE tax = 0; income tax may still apply if otherIncome > 0; show warning if profit < 0 |
| Profit above Social Security wage base | SS portion capped; Medicare continues; coordinate with w2Wages |
| w2Wages already at wage base | SE Social Security portion = 0 |
| Additional Medicare Tax | Apply when combined wages + SE income exceed threshold (TODO_VERIFY thresholds) |
| Very high income | All brackets apply; no special handling beyond config |
| MFJ with only one spouse having SE income | filingStatus handles brackets; no separate spouse income fields in 1.0 |

---

## Validation Rules

| Field | Rule | Error code |
|---|---|---|
| `taxYear` | Must have config entry | `UNSUPPORTED_YEAR` |
| `netBusinessProfit` | >= -999999999 and <= 999999999 cents | `OUT_OF_RANGE` |
| `w2Wages` | >= 0 | `OUT_OF_RANGE` |
| `otherIncome` | >= 0 | `OUT_OF_RANGE` |
| `itemizedDeductions` | >= 0; required if `useStandardDeduction === false` | `REQUIRED` / `OUT_OF_RANGE` |
| Config | `verifiedAt` non-null in production | `UNVERIFIED_CONFIG` |

---

## Disclaimer Copy

> **Estimate only — not tax advice.** This calculator provides a simplified federal tax estimate based on the inputs you supply and IRS-published rules for the selected tax year. It is not a substitute for professional tax advice, does not prepare or file tax returns, and may not reflect your actual tax liability. TaxChecker is not affiliated with the IRS. Consult a qualified tax professional for advice specific to your situation.

---

## Suggested Internal Links

- [1099 Tax Calculator](/calculators/1099-tax) — "Receiving 1099-NEC forms?"
- [Quarterly Tax Calculator](/calculators/quarterly-tax) — "Plan your quarterly payments"
- [Estimated Tax Calculator](/calculators/estimated-tax) — "Full estimated tax worksheet"
- [SEP IRA Calculator](/calculators/sep-ira) — "Reduce taxes with retirement contributions"
- [W2 vs 1099 Calculator](/calculators/w2-vs-1099) — "Compare employment structures"

---

## Monetization Placement Notes

| Placement | Recommendation |
|---|---|
| Below result cards | Affiliate CTA: accounting software (QuickBooks, FreshBooks) — "Track expenses to calculate net profit" |
| Sidebar / footer | CPA marketplace or "Talk to a pro" lead gen (clearly labeled sponsored) |
| Post-calculation email gate (optional) | Save results PDF — email capture for nurture |
| Avoid | Placing ads above primary input form; interferes with trust |

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-16 | Initial specification |
