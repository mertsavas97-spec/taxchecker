# Quarterly Tax Calculator — Specification

**Calculator ID:** `quarterly-tax`  
**Route (future):** `/calculators/quarterly-tax`  
**Engine module:** `src/lib/tax-engine/calculators/quarterly-tax.ts`  
**TaxChecker version:** 1.0

---

## Purpose

Estimate **how much to pay each quarter** in federal estimated taxes for self-employed individuals and others with income not subject to sufficient withholding. Emphasizes payment schedule, due dates, and per-quarter amounts.

---

## Target User

- Self-employed individuals making quarterly estimated payments (1040-ES)
- Freelancers who got a tax bill at filing and want to avoid repeat
- Users searching before Q1 (April), Q2 (June), Q3 (September), or Q4 (January) deadlines

---

## SEO Intent

| Element | Value |
|---|---|
| **Primary keyword** | quarterly tax calculator |
| **Secondary keywords** | estimated tax payment calculator, 1040-ES calculator, self employed quarterly taxes, when are quarterly taxes due |
| **Search intent** | Action-oriented — user needs a payment amount and deadline |
| **Title tag (future)** | Quarterly Tax Calculator — 1040-ES Payment Estimates \| TaxChecker |

---

## Required Inputs

| Field | Type | Description |
|---|---|---|
| `taxYear` | `number` | Tax year for which estimates are paid |
| `filingStatus` | `FilingStatus` | Filing status |
| `netBusinessProfit` | `Cents` | Expected annual net self-employment profit |

---

## Optional Inputs

| Field | Type | Default | Description |
|---|---|---|---|
| `w2Wages` | `Cents` | `0` | Expected annual W-2 wages |
| `otherIncome` | `Cents` | `0` | Other expected ordinary income |
| `federalWithholding` | `Cents` | `0` | Expected annual federal withholding |
| `priorYearTax` | `Cents` | `null` | Prior year total tax (for safe harbor) |
| `priorYearAGI` | `Cents` | `null` | Prior year AGI (for 110% safe harbor) |
| `paymentsMadeToDate` | `Cents` | `0` | Estimated payments already made this year |
| `currentQuarter` | `1 \| 2 \| 3 \| 4` | auto | Which quarter user is planning for |

---

## Outputs

| Output | Type | Description |
|---|---|---|
| `annualTaxLiability` | `Cents` | SE tax + income tax estimate |
| `annualEstimatedRequired` | `Cents` | After safe harbor consideration |
| `quarterlyPaymentAmount` | `Cents` | Equal installment amount |
| `quarterlyPayments` | `[Cents × 4]` | Per-quarter amounts (remainder in Q1) |
| `dueDates` | `[ISO date × 4]` | From TaxYearConfig |
| `remainingAnnual` | `Cents` | annualEstimatedRequired - withholding - paymentsMade |
| `safeHarborMet` | `boolean` | Whether prior-year safe harbor applies |
| `safeHarborMethod` | `string` | Which method used |
| Full SE + income tax breakdown | — | Same as self-employed calculator |

---

## Result Cards

| Card ID | Label | Value source | Variant |
|---|---|---|---|
| `quarterly-amount` | Estimated Quarterly Payment | `quarterlyPaymentAmount` | `highlight` |
| `annual-liability` | Estimated Annual Tax | `annualTaxLiability` | `liability` |
| `next-due-date` | Next Payment Due | computed from `dueDates` | `default` |
| `remaining` | Remaining for Year | `remainingAnnual` | `default` |
| `safe-harbor` | Safe Harbor Status | `safeHarborMet` (text) | `informational` |

---

## Formula Dependencies

```
// Step 1: Annual liability (self-employed pipeline)
annualTaxLiability = seTax + incomeTax

// Step 2: Estimated tax module
annualEstimatedRequired = computeRequiredAnnual(
  annualTaxLiability,
  federalWithholding,
  priorYearTax,
  priorYearAGI,
  config.estimatedTax
)
quarterlyPayments = splitEqualQuarters(annualEstimatedRequired - federalWithholding)
remainingAnnual = max(0, annualEstimatedRequired - federalWithholding - paymentsMadeToDate)
```

**Engine modules:** `self-employment-tax`, `deductions`, `federal-income-tax`, `estimated-tax`

---

## IRS / Public References

- [Form 1040-ES](https://www.irs.gov/forms-pubs/about-form-1040-es)
- [Instructions for Form 1040-ES](https://www.irs.gov/instructions/i1040es)
- [Publication 505 — Tax Withholding and Estimated Tax](https://www.irs.gov/publications/p505)
- [Schedule SE](https://www.irs.gov/forms-pubs/about-schedule-se-form-1040)

---

## Assumptions

1. **Equal quarterly installments** — IRS default method; annualization deferred to v2.
2. Income spread evenly through the year.
3. Safe harbor uses prior-year tax if provided; otherwise shows 90% current-year target.
4. Due dates from config; adjusted for weekends/holidays per IRS rules (TODO_VERIFY annually).
5. Underpayment penalty **not calculated** in 1.0 — flag `underpaymentRisk` only.

---

## Exclusions

- Form 2210 underpayment penalty calculation
- Annualized income installment method (Schedule AI)
- State estimated tax payments
- Corporate estimated tax (Form 1120-W)
- Credits reducing required payments (except withholding offset)

---

## Edge Cases

| Case | Handling |
|---|---|
| paymentsMadeToDate > required | Show $0 remaining; note overpayment |
| priorYearTax provided, AGI missing | Use 100% safe harbor; 110% requires AGI |
| Current quarter = 3, no prior payments | Show catch-up suggestion (informational; equal split still default) |
| Zero SE income | Quarterly = 0 if no other tax liability |
| Tax year due date on weekend | Use next business day per IRS (config) |

---

## Validation Rules

| Field | Rule | Error code |
|---|---|---|
| `priorYearTax` | >= 0 if provided | `OUT_OF_RANGE` |
| `paymentsMadeToDate` | >= 0 | `OUT_OF_RANGE` |
| `currentQuarter` | 1-4 | `OUT_OF_RANGE` |
| Base inputs | Same as self-employed-tax | — |

---

## Disclaimer Copy

> **Estimate only — not tax advice.** Quarterly payment amounts are estimates based on annualized income you provide. Actual required payments may differ if your income varies, you owe AMT, or you qualify for different safe harbor rules. Missing estimated tax payments may result in IRS penalties. This calculator does not compute penalties. Consult a tax professional or refer to [Publication 505](https://www.irs.gov/publications/p505) for official guidance.

---

## Suggested Internal Links

- [Estimated Tax Calculator](/calculators/estimated-tax) — full worksheet with credits
- [Self Employed Tax Calculator](/calculators/self-employed-tax)
- [1099 Tax Calculator](/calculators/1099-tax)

---

## Monetization Placement Notes

| Placement | Recommendation |
|---|---|
| Near due date card | Calendar/reminder app integration or email reminder signup |
| Below quarterly amount | Business banking (high-yield business savings for tax reserve) |
| Seasonal | Increase CPA lead gen Q4/Q1 without alarmist copy |

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-16 | Initial specification |
