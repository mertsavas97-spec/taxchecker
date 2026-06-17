# S Corp Tax Calculator — Specification

**Calculator ID:** `s-corp-tax`  
**Route (future):** `/calculators/s-corp-tax`  
**Engine module:** `src/lib/tax-engine/calculators/s-corp-tax.ts`  
**TaxChecker version:** 1.0

---

## Purpose

Estimate federal taxes for an **S Corporation** owner-employee, modeling the split between **W-2 salary** (subject to payroll tax) and **distributions** (not subject to self-employment tax). Shows payroll tax on salary, federal income tax on combined income, and total tax burden.

---

## Target User

- Business owners already operating or considering an S Corp election
- LLC owners evaluating S Corp status
- Users searching "S corp tax calculator" or "S corp salary calculator"
- Accountants validating rough estimates (not a replacement for professional tools)

---

## SEO Intent

| Element | Value |
|---|---|
| **Primary keyword** | S corp tax calculator |
| **Secondary keywords** | S corporation tax calculator, S corp salary vs distribution, reasonable salary S corp calculator, S corp self employment tax savings |
| **Search intent** | Planning — optimize salary/distribution split |
| **Title tag (future)** | S Corp Tax Calculator — Salary, Payroll & Income Tax \| TaxChecker |

---

## Required Inputs

| Field | Type | Description |
|---|---|---|
| `taxYear` | `number` | Tax year |
| `filingStatus` | `FilingStatus` | Filing status |
| `netBusinessProfit` | `Cents` | S Corp net profit before owner salary (ordinary business income) |
| `ownerSalary` | `Cents` | W-2 salary paid to owner (or `salaryPercent` — one required) |

**Alternative salary input:**

| Field | Type | Description |
|---|---|---|
| `salaryPercent` | `number` | Percent of net profit allocated to salary (0-100); engine computes `ownerSalary` |

---

## Optional Inputs

| Field | Type | Default | Description |
|---|---|---|---|
| `otherIncome` | `Cents` | `0` | Non-S Corp ordinary income |
| `otherW2Wages` | `Cents` | `0` | W-2 wages from other employers (SS wage base) |
| `businessExpenses` | `Cents` | `0` | Already netted in profit unless gross mode added later |
| `useStandardDeduction` | `boolean` | `true` | Standard deduction |

---

## Outputs

| Output | Type | Description |
|---|---|---|
| `ownerSalary` | `Cents` | Salary amount used |
| `distribution` | `Cents` | netBusinessProfit - ownerSalary |
| `employeeFICA` | `Cents` | Employee SS + Medicare on salary |
| `employerFICA` | `Cents` | Employer SS + Medicare on salary |
| `totalPayrollTax` | `Cents` | employeeFICA + employerFICA (owner cost = both from corp perspective) |
| `ownerPayrollTaxCost` | `Cents` | Employee FICA (owner out-of-pocket); employer paid by corp |
| `adjustedGrossIncome` | `Cents` | Salary + distribution + other - adjustments |
| `taxableIncome` | `Cents` | After deduction |
| `federalIncomeTax` | `Cents` | Ordinary income tax |
| `totalOwnerTaxBurden` | `Cents` | employeeFICA + federalIncomeTax (owner personal liability view) |
| `totalTaxIncludingEmployer` | `Cents` | All taxes including employer FICA (economic cost) |

---

## Result Cards

| Card ID | Label | Value source | Variant |
|---|---|---|---|
| `total-tax` | Total Estimated Federal Tax | `totalTaxIncludingEmployer` or owner view | `liability` |
| `payroll-tax` | Payroll Tax on Salary | `totalPayrollTax` | `default` |
| `income-tax` | Federal Income Tax | `federalIncomeTax` | `default` |
| `salary` | Owner W-2 Salary | `ownerSalary` | `default` |
| `distribution` | S Corp Distribution | `distribution` | `default` |

---

## Formula Dependencies

```
ownerSalary = salaryPercent ? netBusinessProfit × salaryPercent : ownerSalary
distribution = netBusinessProfit - ownerSalary

employeeFICA = computeEmployeeFICA(ownerSalary + otherW2Wages, ...) // coordinate wage base
employerFICA = computeEmployerFICA(ownerSalary, ...)

// S Corp income passes through — not subject to SE tax on distribution
agi = ownerSalary + distribution + otherIncome + otherW2Wages - adjustments
taxableIncome = agi - deduction
federalIncomeTax = computeFederalIncomeTax(taxableIncome, filingStatus)

totalPayrollTax = employeeFICA + employerFICA
```

**Engine modules:** `payroll-tax`, `federal-income-tax`, `deductions`, `business-entity` (partial)

---

## IRS / Public References

- [S Corporations](https://www.irs.gov/businesses/small-businesses-self-employed/s-corporations)
- [Publication 535 — Business Expenses](https://www.irs.gov/publications/p535)
- [Publication 15](https://www.irs.gov/publications/p15) — payroll tax
- [Instructions for Form 1120-S](https://www.irs.gov/instructions/i1120s) — context only

---

## Assumptions

1. **User sets salary** — engine does not compute "reasonable compensation."
2. S Corp election is valid and in place for full year.
3. Profit equals pass-through ordinary income (no separately stated items).
4. Owner is single shareholder employee model.
5. Employer FICA is economic cost to owner (paid by corporation).
6. No state corporate or franchise tax.
7. Distributions are not wages; no payroll tax on distributions.

---

## Exclusions

- Reasonable compensation determination
- State income and franchise taxes
- QBI deduction
- Built-in gains, AAA, distributions exceeding basis
- Multiple shareholders
- Payroll processing fees, unemployment tax
- Form 2553 election timing

---

## Edge Cases

| Case | Handling |
|---|---|
| ownerSalary > netBusinessProfit | Validation error `INCONSISTENT` |
| ownerSalary = 0 | Warning: IRS requires reasonable compensation for services |
| ownerSalary = 100% of profit | No distribution; behaves like W-2 + zero pass-through |
| netBusinessProfit < 0 | No payroll on negative; income tax from other income only |
| Salary at SS wage base | FICA caps apply |

---

## Validation Rules

| Field | Rule | Error code |
|---|---|---|
| `ownerSalary` | >= 0 and <= netBusinessProfit | `INCONSISTENT` |
| `salaryPercent` | 0-100 if used | `OUT_OF_RANGE` |
| `netBusinessProfit` | Valid range | `OUT_OF_RANGE` |
| Salary input | ownerSalary OR salaryPercent required | `REQUIRED` |

---

## Disclaimer Copy

> **Estimate only — not tax advice.** S Corporation taxation involves complex rules including reasonable salary requirements, basis limitations, and entity formalities. This calculator models federal payroll and income taxes on your inputs and does not determine whether your salary is reasonable under IRS standards. Improper S Corp elections or inadequate salary can result in penalties and reclassification. Consult a CPA or tax attorney before electing or operating as an S Corp.

---

## Suggested Internal Links

- [LLC vs S Corp Calculator](/calculators/llc-vs-scorp)
- [W2 vs 1099 Calculator](/calculators/w2-vs-1099)
- [Self Employed Tax Calculator](/calculators/self-employed-tax) — LLC without S Corp
- [Quarterly Tax Calculator](/calculators/quarterly-tax)

---

## Monetization Placement Notes

| Placement | Recommendation |
|---|---|
| Salary slider area | Payroll service affiliate (Gusto, ADP) |
| Post-results | S Corp formation / registered agent services |
| High savings vs LLC | CPA consultation CTA with compliance emphasis |

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-16 | Initial specification |
