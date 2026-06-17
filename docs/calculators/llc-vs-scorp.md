# LLC vs S Corp Calculator — Specification

**Calculator ID:** `llc-vs-s-corp`  
**Route (future):** `/calculators/llc-vs-scorp`  
**Engine module:** `src/lib/tax-engine/calculators/llc-vs-s-corp.ts`  
**TaxChecker version:** 1.0

---

## Purpose

Compare estimated **total federal tax burden** between two business structures at the same net profit: (A) **LLC taxed as sole proprietorship** (disregarded entity, full SE tax on net profit) and (B) **LLC/S Corp with S election** (salary + distribution split, payroll tax on salary only). Quantifies potential SE tax savings from S Corp election.

---

## Target User

- Single-member LLC owners considering S Corp election
- New business owners choosing entity structure
- Freelancers earning enough that S Corp savings may matter (typically $40k+ net — marketing note, not engine rule)
- Users searching "LLC vs S Corp taxes"

---

## SEO Intent

| Element | Value |
|---|---|
| **Primary keyword** | LLC vs S corp calculator |
| **Secondary keywords** | LLC or S corp tax calculator, S corp vs LLC tax savings, should I elect S corp, single member LLC S corp comparison |
| **Search intent** | Decision support — which structure saves taxes |
| **Title tag (future)** | LLC vs S Corp Tax Calculator — Compare Federal Taxes \| TaxChecker |

---

## Required Inputs

| Field | Type | Description |
|---|---|---|
| `taxYear` | `number` | Tax year |
| `filingStatus` | `FilingStatus` | Filing status |
| `netBusinessProfit` | `Cents` | Annual net business profit |
| `proposedOwnerSalary` | `Cents` | Intended S Corp owner salary (or percent) |

---

## Optional Inputs

| Field | Type | Default | Description |
|---|---|---|---|
| `salaryPercent` | `number` | `null` | Alternative to fixed salary |
| `otherIncome` | `Cents` | `0` | Non-business income |
| `otherW2Wages` | `Cents` | `0` | Other W-2 wages |
| `sCorpFormationCost` | `Cents` | `0` | Informational only — not in tax calc |
| `annualPayrollServiceCost` | `Cents` | `0` | Informational — net savings after costs |

---

## Outputs

### LLC (Sole Prop) Path

| Output | Type | Description |
|---|---|---|
| `llcSelfEmploymentTax` | `Cents` | SE tax on full net profit |
| `llcFederalIncomeTax` | `Cents` | Income tax |
| `llcTotalTax` | `Cents` | SE + income tax |

### S Corp Path

| Output | Type | Description |
|---|---|---|
| `sCorpSalary` | `Cents` | Owner W-2 salary |
| `sCorpDistribution` | `Cents` | Remaining profit |
| `sCorpPayrollTax` | `Cents` | Employee + employer FICA on salary |
| `sCorpFederalIncomeTax` | `Cents` | Income tax on pass-through |
| `sCorpTotalTax` | `Cents` | Payroll + income tax (economic) |

### Comparison

| Output | Type | Description |
|---|---|---|
| `annualTaxSavings` | `Cents` | llcTotalTax - sCorpTotalTax |
| `netSavingsAfterCosts` | `Cents` | annualTaxSavings - payrollServiceCost (informational) |
| `breakevenProfit` | `Cents` | null in 1.0 — deferred |
| `recommendedStructure` | `'llc' \| 's_corp' \| 'similar'` | Based on savings threshold |

---

## Result Cards

| Card ID | Label | Value source | Variant |
|---|---|---|---|
| `tax-savings` | Estimated Annual Tax Savings (S Corp) | `annualTaxSavings` | `savings` |
| `llc-total` | LLC Total Federal Tax | `llcTotalTax` | `liability` |
| `scorp-total` | S Corp Total Federal Tax | `sCorpTotalTax` | `liability` |
| `llc-se-tax` | LLC Self-Employment Tax | `llcSelfEmploymentTax` | `default` |
| `scorp-payroll` | S Corp Payroll Tax | `sCorpPayrollTax` | `default` |

---

## Formula Dependencies

```
// LLC path — full self-employed pipeline on netBusinessProfit
llcSETax = computeSETax(netBusinessProfit, otherW2Wages, ...)
llcIncomeTax = computeFederalIncomeTax(taxableIncomeLLC, ...)
llcTotalTax = llcSETax + llcIncomeTax

// S Corp path — business-entity module
sCorpResult = computeSCorpPath(netBusinessProfit, proposedOwnerSalary, ...)
sCorpTotalTax = sCorpResult.payrollTax + sCorpResult.incomeTax

annualTaxSavings = llcTotalTax - sCorpTotalTax
```

**Engine modules:** `business-entity`, `self-employment-tax`, `payroll-tax`, `federal-income-tax`, `deductions`

---

## IRS / Public References

- [Single Member LLC](https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies)
- [S Corporations](https://www.irs.gov/publications/p589) / IRS S Corp overview
- [Publication 3402](https://www.irs.gov/publications/p3402)
- [Schedule SE](https://www.irs.gov/forms-pubs/about-schedule-se-form-1040)
- [Publication 15](https://www.irs.gov/publications/p15)

---

## Assumptions

1. LLC default = disregarded entity (sole prop), not LLC taxed as C corp.
2. S Corp path assumes valid Form 2553 election.
3. Same net profit in both scenarios.
4. User supplies proposed salary; not validated for reasonableness.
5. Economic tax cost includes employer FICA (paid by business).
6. Formation and compliance costs shown separately, not subtracted unless user enters `annualPayrollServiceCost`.
7. Federal only.

---

## Exclusions

- C Corporation comparison
- Partnership / multi-member LLC
- State entity taxes and fees
- QBI deduction interaction
- Reasonable salary IRS scrutiny
- Legal liability differences (non-tax)
- Retirement plan differences (link to Solo 401k)

---

## Edge Cases

| Case | Handling |
|---|---|
| Low profit (< ~$10k) | S Corp may cost more; show negative savings |
| Salary = 100% of profit | S Corp ≈ W-2 scenario; minimal SE savings |
| Salary = 0 | Validation warning + error |
| Negative savings | recommendedStructure = 'llc' |
| Savings < $500 | recommendedStructure = 'similar' |

---

## Validation Rules

| Field | Rule | Error code |
|---|---|---|
| `proposedOwnerSalary` | <= netBusinessProfit, >= 0 | `INCONSISTENT` |
| `netBusinessProfit` | > 0 for meaningful comparison | `OUT_OF_RANGE` (warning if low) |
| Salary | salary or percent required | `REQUIRED` |

---

## Disclaimer Copy

> **Estimate only — not tax advice.** Tax savings from an S Corporation depend on reasonable salary, compliance costs, state rules, and your full financial picture. This calculator compares simplified federal tax scenarios and ignores legal liability, administrative burden, and basis rules. The IRS requires S Corp owner-employees to pay themselves reasonable compensation. Consult a CPA or attorney before electing S Corp status.

---

## Suggested Internal Links

- [S Corp Tax Calculator](/calculators/s-corp-tax)
- [Self Employed Tax Calculator](/calculators/self-employed-tax)
- [W2 vs 1099 Calculator](/calculators/w2-vs-1099)
- [Solo 401(k) Calculator](/calculators/solo-401k)

---

## Monetization Placement Notes

| Placement | Recommendation |
|---|---|
| Savings highlight | Registered agent / incorporation services |
| Compliance note | Bookkeeping + payroll bundle affiliate |
| Negative savings result | LLC maintenance / accounting software (no shame copy) |

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-16 | Initial specification |
