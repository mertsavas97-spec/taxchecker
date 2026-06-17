# Estimated Tax Calculator — Specification

**Calculator ID:** `estimated-tax`  
**Route (future):** `/calculators/estimated-tax`  
**Engine module:** `src/lib/tax-engine/calculators/estimated-tax.ts`  
**TaxChecker version:** 1.0

---

## Purpose

Provide a comprehensive **federal estimated tax worksheet** for individuals who need to pay tax throughout the year on income not fully covered by withholding. Combines self-employment income, other income sources, deductions, withholding, and safe harbor analysis into annual and quarterly payment recommendations.

More complete than Quarterly Tax Calculator; less entity-specific than Self Employed calculator alone.

---

## Target User

- Self-employed with multiple income streams
- Investors with significant non-wage income (simplified in 1.0)
- W-2 employees with side income insufficiently withheld
- Tax planners comparing safe harbor options

---

## SEO Intent

| Element | Value |
|---|---|
| **Primary keyword** | estimated tax calculator |
| **Secondary keywords** | federal estimated tax calculator, 1040-ES estimated tax, how much estimated tax to pay, self employed estimated taxes |
| **Search intent** | Planning — user wants full-year estimated tax picture |
| **Title tag (future)** | Estimated Tax Calculator — Federal 1040-ES Worksheet \| TaxChecker |

---

## Required Inputs

| Field | Type | Description |
|---|---|---|
| `taxYear` | `number` | Tax year |
| `filingStatus` | `FilingStatus` | Filing status |
| `expectedAGIComponents` | object | At minimum one income source |

### `expectedAGIComponents` (at least one required)

| Field | Type | Description |
|---|---|---|
| `netBusinessProfit` | `Cents` | Net SE profit (default 0) |
| `w2Wages` | `Cents` | W-2 wages (default 0) |
| `otherOrdinaryIncome` | `Cents` | Interest, dividends, other ordinary (default 0) |

---

## Optional Inputs

| Field | Type | Default | Description |
|---|---|---|---|
| `federalWithholding` | `Cents` | `0` | Expected W-2 and other withholding |
| `estimatedTaxPaymentsMade` | `Cents` | `0` | Prior estimated payments this year |
| `priorYearTotalTax` | `Cents` | `null` | Line 24 prior year 1040 equivalent |
| `priorYearAGI` | `Cents` | `null` | Prior year AGI |
| `itemizedDeductions` | `Cents` | `0` | If not using standard |
| `useStandardDeduction` | `boolean` | `true` | Standard deduction toggle |
| `otherAdjustments` | `Cents` | `0` | IRA, HSA, etc. — user-supplied aggregate |

---

## Outputs

| Output | Type | Description |
|---|---|---|
| `totalAnnualTaxLiability` | `Cents` | SE + income tax |
| `requiredAnnualPayment` | `Cents` | After safe harbor |
| `shortfall` | `Cents` | Required minus withholding and payments made |
| `quarterlyPayment` | `Cents` | Recommended equal installment |
| `quarterlyBreakdown` | `[Cents × 4]` | Per quarter |
| `dueDates` | `[ISO × 4]` | Payment deadlines |
| `safeHarborAnalysis` | object | Methods compared |
| `componentBreakdown` | BreakdownLine[] | SE tax, income tax, deductions |
| `marginalRate` | `number` | Federal marginal rate |

### `safeHarborAnalysis`

| Field | Description |
|---|---|
| `currentYear90Percent` | 90% of current year tax (TODO_VERIFY rate) |
| `priorYear100Percent` | 100% of prior year tax if AGI below threshold |
| `priorYear110Percent` | 110% if prior AGI above threshold |
| `recommendedMethod` | Lowest payment meeting safe harbor |
| `safeHarborMet` | boolean |

---

## Result Cards

| Card ID | Label | Value source | Variant |
|---|---|---|---|
| `required-annual` | Required Annual Estimated Tax | `requiredAnnualPayment` | `liability` |
| `quarterly` | Suggested Quarterly Payment | `quarterlyPayment` | `highlight` |
| `shortfall` | Remaining Tax to Cover | `shortfall` | `liability` |
| `total-liability` | Estimated Total Tax Liability | `totalAnnualTaxLiability` | `default` |
| `safe-harbor` | Recommended Safe Harbor | text from analysis | `informational` |

---

## Formula Dependencies

```
// Income tax path
seTax = computeSETax(netBusinessProfit, w2Wages, ...)  // if netBusinessProfit > 0
deductibleSETax = seTax × 0.5
agi = w2Wages + netBusinessProfit + otherOrdinaryIncome - deductibleSETax - otherAdjustments
taxableIncome = agi - deduction
incomeTax = computeFederalIncomeTax(taxableIncome, filingStatus)
totalAnnualTaxLiability = seTax + incomeTax

// Estimated tax path
requiredAnnualPayment = min applicable safe harbor or total liability per Pub 505
shortfall = max(0, requiredAnnualPayment - federalWithholding - estimatedTaxPaymentsMade)
quarterlyPayment = ceil_or_floor per rounding rules (splitEqualQuarters)
```

**Engine modules:** Full income cluster + `estimated-tax`

---

## IRS / Public References

- [Publication 505](https://www.irs.gov/publications/p505)
- [Form 1040-ES](https://www.irs.gov/forms-pubs/about-form-1040-es)
- [Schedule SE](https://www.irs.gov/forms-pubs/about-schedule-se-form-1040)
- Rev. Proc. — brackets and deductions

---

## Assumptions

1. Ordinary income only — capital gains rates excluded in 1.0.
2. Safe harbor thresholds from config (TODO_VERIFY).
3. User aggregates adjustments; no line-by-line 1040.
4. Equal quarterly installments.
5. W-2 withholding treated as fixed annual estimate.

---

## Exclusions

- Form 2210 penalty calculation
- Schedule D / capital gains
- AMT, NIIT, premium tax credit
- State estimated tax
- Annualized income installment method

---

## Edge Cases

| Case | Handling |
|---|---|
| Only W-2 income, no SE | SE tax = 0; estimate if withholding insufficient |
| priorYearTotalTax = 0 | Safe harbor may be $0; show warning |
| High AGI triggers 110% rule | Requires priorYearAGI input |
| Negative shortfall | User overpaid; show informational message |

---

## Validation Rules

| Field | Rule | Error code |
|---|---|---|
| Income components | At least one > 0 OR explicit zero with acknowledgment | `REQUIRED` |
| All monetary fields | Valid cent ranges | `OUT_OF_RANGE` |
| `priorYearTotalTax` | Required if using prior-year safe harbor toggle | `REQUIRED` |

---

## Disclaimer Copy

> **Estimate only — not tax advice.** This worksheet simplifies IRS estimated tax rules and may not include all factors affecting your required payments. Safe harbor calculations require accurate prior-year tax information. Underpayment penalties are not computed. For official payment vouchers, use [Form 1040-ES](https://www.irs.gov/forms-pubs/about-form-1040-es). Consult a qualified tax professional for personalized guidance.

---

## Suggested Internal Links

- [Quarterly Tax Calculator](/calculators/quarterly-tax) — simplified quarterly view
- [Self Employed Tax Calculator](/calculators/self-employed-tax)
- [1099 Tax Calculator](/calculators/1099-tax)

---

## Monetization Placement Notes

| Placement | Recommendation |
|---|---|
| Safe harbor comparison section | Tax planning software affiliate |
| Export PDF feature | Email gate for lead nurture |
| High shortfall results | CPA consultation CTA (neutral tone) |

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-16 | Initial specification |
