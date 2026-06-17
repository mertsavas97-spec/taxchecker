# SEP IRA Calculator — Specification

**Calculator ID:** `sep-ira`  
**Route (future):** `/calculators/sep-ira`  
**Engine module:** `src/lib/tax-engine/calculators/sep-ira.ts`  
**TaxChecker version:** 1.0

---

## Purpose

Estimate the **maximum SEP IRA contribution** for a self-employed individual and the resulting **federal income tax savings**. Uses IRS compensation definition for self-employed persons per Publication 560.

---

## Target User

- Sole proprietors and single-member LLC owners without employees (or only spouse)
- Freelancers wanting simple retirement plan with high contribution limits
- Users comparing SEP vs Solo 401(k)
- Users searching "SEP IRA calculator" or "SEP IRA contribution limit"

---

## SEO Intent

| Element | Value |
|---|---|
| **Primary keyword** | SEP IRA calculator |
| **Secondary keywords** | SEP IRA contribution calculator, self employed SEP IRA limit, SEP IRA tax savings, how much can I contribute to SEP IRA |
| **Search intent** | Planning — max contribution and tax benefit |
| **Title tag (future)** | SEP IRA Calculator — Max Contribution & Tax Savings \| TaxChecker |

---

## Required Inputs

| Field | Type | Description |
|---|---|---|
| `taxYear` | `number` | Tax year |
| `filingStatus` | `FilingStatus` | For marginal rate |
| `netBusinessProfit` | `Cents` | Net self-employment profit |

---

## Optional Inputs

| Field | Type | Description |
|---|---|---|
| `w2Wages` | `Cents` | Default 0 — other wages for SS coordination |
| `plannedContribution` | `Cents` | Default = max allowable |
| `age` | `number` | SEP has no age-based limit increase (unlike 401k catch-up) — collect for future cross-sell |
| `hasEmployees` | `boolean` | Default false; if true, show warning that 1.0 does not model employee allocations |

---

## Outputs

| Output | Type | Description |
|---|---|---|
| `netEarnings` | `Cents` | Net earnings from self-employment |
| `selfEmploymentTax` | `Cents` | SE tax on profit |
| `deductibleSETax` | `Cents` | 50% SE tax deduction |
| `compensation` | `Cents` | Pub 560 adjusted compensation for SEP |
| `maxSepContribution` | `Cents` | min(25% × compensation, annual limit) |
| `allowableContribution` | `Cents` | min(planned, max) |
| `marginalFederalRate` | `number` | For savings estimate |
| `federalTaxSavings` | `Cents` | Contribution × marginal rate |
| `effectiveCostAfterTax` | `Cents` | allowableContribution - federalTaxSavings |

---

## Result Cards

| Card ID | Label | Value source | Variant |
|---|---|---|---|
| `max-contribution` | Maximum SEP IRA Contribution | `maxSepContribution` | `highlight` |
| `tax-savings` | Estimated Federal Tax Savings | `federalTaxSavings` | `savings` |
| `net-cost` | Net Cost After Tax Savings | `effectiveCostAfterTax` | `default` |
| `compensation` | Plan Compensation | `compensation` | `informational` |
| `your-contribution` | Your Contribution | `allowableContribution` | `default` |

---

## Formula Dependencies

```
// Step 1: SE tax (needed for compensation worksheet)
seResult = computeSETax(netBusinessProfit, w2Wages, filingStatus, config)
deductibleSETax = seResult.deductibleSETax

// Step 2: SEP compensation (Pub 560 worksheet — TODO_VERIFY exact formula)
compensation = computeSelfEmploymentCompensation(netBusinessProfit, deductibleSETax)

// Step 3: SEP limit
theoreticalMax = compensation × config.sepIra.compensationRate  // 25%
maxSepContribution = min(theoreticalMax, config.sepIra.maxContribution)
allowableContribution = min(plannedContribution ?? maxSepContribution, maxSepContribution)

// Step 4: Tax savings (iterative note: contribution reduces taxable income — 1.0 uses simplified marginal)
marginalRate = deriveMarginalRate(taxableIncomeBeforeContribution, filingStatus)
federalTaxSavings = allowableContribution × marginalRate
```

**Engine modules:** `self-employment-tax`, `retirement/shared`, `retirement/sep-ira`, `federal-income-tax`

### Iteration note (document for Sprint 2)

Pub 560 compensation depends on contribution (circular). IRS provides rate table / worksheet. Engine v1.0 may use algebraic solution or fixed-point iteration — document in implementation; spec requires matching Pub 560 result within $1.

---

## IRS / Public References

- [Publication 560 — Retirement Plans for Small Business](https://www.irs.gov/publications/p560)
- [Publication 590-A](https://www.irs.gov/publications/p590a)
- [SEP Plan FAQ](https://www.irs.gov/retirement-plans/retirement-plans-faqs-regarding-seps)

---

## Assumptions

1. Self-employed individual with no eligible employees (or user acknowledges employee coverage requirement).
2. Contribution made for tax year before filing deadline.
3. No other employer retirement plan limiting deferrals (warn if user indicates W-2 with 401k).
4. Marginal rate method for tax savings (not full recompute of taxable income in 1.0 — enhancement).
5. Federal income tax savings only.

---

## Exclusions

- Employee SEP allocations (pro-rata requirement)
- Integration with Solo 401(k) — cannot use both for same business in 1.0 without warning
- State tax savings
- S Corp owner — SEP via corp; use different compensation path (v1.1)
- Catch-up contributions (SEP IRA has none)
- Form 5305-SEP setup guidance

---

## Edge Cases

| Case | Handling |
|---|---|
| netBusinessProfit = 0 | maxSepContribution = 0 |
| Very high profit | Capped at config.sepIra.maxContribution |
| hasEmployees = true | Warning: "Employer must contribute for all eligible employees" |
| plannedContribution > max | Cap with warning |
| Circular compensation | Use Pub 560 rate table (TODO_VERIFY) |

---

## Validation Rules

| Field | Rule | Error code |
|---|---|---|
| `netBusinessProfit` | >= 0 | `OUT_OF_RANGE` |
| `plannedContribution` | >= 0 if provided | `OUT_OF_RANGE` |
| `hasEmployees` | true shows warning, not block | — |

---

## Disclaimer Copy

> **Estimate only — not tax advice.** SEP IRA contribution limits for self-employed individuals use a special compensation calculation from IRS Publication 560. If you have employees, you must generally make comparable contributions for them. SEP contributions must be made by your tax filing deadline. This calculator does not establish a SEP plan or verify eligibility. Consult a financial or tax advisor.

---

## Suggested Internal Links

- [Solo 401(k) Calculator](/calculators/solo-401k) — compare plans
- [Self Employed Tax Calculator](/calculators/self-employed-tax)
- [HSA Tax Savings Calculator](/calculators/hsa-tax)
- [LLC vs S Corp Calculator](/calculators/llc-vs-scorp)

---

## Monetization Placement Notes

| Placement | Recommendation |
|---|---|
| Max contribution card | Brokerage IRA open CTA (Schwab, Fidelity affiliate) |
| Comparison hook | "Compare with Solo 401(k)" internal link before affiliate |
| High income users | Financial advisor lead gen |

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-16 | Initial specification |
