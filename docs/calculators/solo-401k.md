# Solo 401(k) Calculator — Specification

**Calculator ID:** `solo-401k`  
**Route (future):** `/calculators/solo-401k`  
**Engine module:** `src/lib/tax-engine/calculators/solo-401k.ts`  
**TaxChecker version:** 1.0

---

## Purpose

Estimate **maximum Solo 401(k) contributions** (employee elective deferral + employer profit-sharing) for a self-employed individual with no employees other than a spouse, and calculate **federal income tax savings** from those contributions.

---

## Target User

- Self-employed with no employees (business owner only + optional spouse)
- High earners seeking higher deferral than SEP IRA alone
- LLC/S Corp owners evaluating retirement options
- Users searching "solo 401k calculator" or "individual 401k contribution limit"

---

## SEO Intent

| Element | Value |
|---|---|
| **Primary keyword** | solo 401k calculator |
| **Secondary keywords** | solo 401k contribution calculator, individual 401k calculator, self employed 401k limit, one participant 401k calculator |
| **Search intent** | Planning — max deferral + tax savings |
| **Title tag (future)** | Solo 401(k) Calculator — Max Contribution & Tax Savings \| TaxChecker |

---

## Required Inputs

| Field | Type | Description |
|---|---|---|
| `taxYear` | `number` | Tax year |
| `filingStatus` | `FilingStatus` | Marginal rate estimation |
| `netBusinessProfit` | `Cents` | Net self-employment profit |
| `age` | `number` | Determines catch-up eligibility |

---

## Optional Inputs

| Field | Type | Default | Description |
|---|---|---|---|
| `w2Wages` | `Cents` | `0` | Other wages |
| `plannedEmployeeDeferral` | `Cents` | `null` | Defaults to max employee deferral |
| `plannedEmployerContribution` | `Cents` | `null` | Defaults to max profit-sharing allowed |
| `businessStructure` | `'sole_prop' \| 's_corp'` | `'sole_prop'` | S Corp uses W-2 salary as comp base |
| `sCorpSalary` | `Cents` | `0` | Required if structure = s_corp |

---

## Outputs

| Output | Type | Description |
|---|---|---|
| `compensation` | `Cents` | Plan compensation per Pub 560 |
| `maxEmployeeDeferral` | `Cents` | Elective deferral limit + catch-up if eligible |
| `maxEmployerContribution` | `Cents` | Profit-sharing (25% of comp) within 415(c) room |
| `maxTotalContribution` | `Cents` | Employee + employer, capped by 415(c) |
| `employeeDeferral` | `Cents` | Actual deferral used |
| `employerContribution` | `Cents` | Actual profit-sharing used |
| `totalContribution` | `Cents` | Sum |
| `marginalFederalRate` | `number` | Rate for savings |
| `federalTaxSavings` | `Cents` | totalContribution × marginalRate (simplified) |
| `effectiveCostAfterTax` | `Cents` | totalContribution - federalTaxSavings |

---

## Result Cards

| Card ID | Label | Value source | Variant |
|---|---|---|---|
| `max-total` | Maximum Total Contribution | `maxTotalContribution` | `highlight` |
| `employee-deferral` | Employee Deferral (Elective) | `employeeDeferral` | `default` |
| `employer-contribution` | Employer Profit-Sharing | `employerContribution` | `default` |
| `tax-savings` | Estimated Federal Tax Savings | `federalTaxSavings` | `savings` |
| `net-cost` | Net Cost After Tax Savings | `effectiveCostAfterTax` | `default` |

---

## Formula Dependencies

```
// Compensation
if businessStructure === 'sole_prop':
  seResult = computeSETax(netBusinessProfit, ...)
  compensation = computeSelfEmploymentCompensation(netBusinessProfit, seResult.deductibleSETax)
else:
  compensation = sCorpSalary  // W-2 from S Corp

// Employee deferral
baseDeferralLimit = config.solo401k.employeeDeferralLimit
catchUp = age >= config.solo401k.catchUpAge ? config.solo401k.catchUpAmount : 0
maxEmployeeDeferral = baseDeferralLimit + catchUp
employeeDeferral = min(plannedEmployeeDeferral ?? maxEmployeeDeferral, maxEmployeeDeferral)

// Employer profit-sharing
employerRate = config.solo401k.employerCompensationRate  // 25%
theoreticalEmployer = compensation × employerRate
remaining415Room = config.solo401k.totalAnnualAdditionLimit - employeeDeferral
maxEmployerContribution = min(theoreticalEmployer, remaining415Room, compensation-based limits)
employerContribution = min(plannedEmployerContribution ?? maxEmployerContribution, maxEmployerContribution)

totalContribution = employeeDeferral + employerContribution
maxTotalContribution = min(maxEmployeeDeferral + maxEmployerContribution, config.solo401k.totalAnnualAdditionLimit)

federalTaxSavings = totalContribution × marginalFederalRate
```

**Engine modules:** `self-employment-tax`, `retirement/shared`, `retirement/solo-401k`, `federal-income-tax`

---

## IRS / Public References

- [One-Participant 401(k) Plans](https://www.irs.gov/retirement-plans/one-participant-401k-plans)
- [Publication 560](https://www.irs.gov/publications/p560)
- [401(k) limit news releases](https://www.irs.gov/newsroom) — annual deferral limits
- [Publication 590-A](https://www.irs.gov/publications/p590a)

---

## Assumptions

1. No common-law employees (other than spouse — treated as no employees in 1.0).
2. Plan established and contributions made within tax year deadlines.
3. Employee deferral limited by compensation (cannot defer more than earned income).
4. 415(c) annual addition limit applies to combined employee + employer contributions.
5. S Corp path: salary must be supplied; profit-sharing based on W-2 salary only in 1.0.
6. Marginal rate approximation for tax savings (full AGI recompute deferred).
7. Federal only.

---

## Exclusions

- Roth vs traditional treatment (default traditional deductible)
- Loan provisions
- Form 5500-EZ filing requirement thresholds
- Multiple unrelated employers 401(k) aggregation (user must reduce deferral manually — warning)
- Defined benefit plan interaction
- State tax savings
- After-tax (mega backdoor) strategies

---

## Edge Cases

| Case | Handling |
|---|---|
| age >= catchUpAge | Add catch-up to deferral limit |
| Low compensation | Deferral cannot exceed compensation |
| s_corp without salary | Validation error `REQUIRED` |
| Deferral + employer hits 415(c) | Cap employer portion |
| User also has W-2 401(k) | Warning: deferral limit shared across plans |
| netBusinessProfit = 0 and sole prop | max contribution = 0 |

---

## Validation Rules

| Field | Rule | Error code |
|---|---|---|
| `age` | 18-100 | `OUT_OF_RANGE` |
| `netBusinessProfit` | >= 0 | `OUT_OF_RANGE` |
| `sCorpSalary` | > 0 if businessStructure = s_corp | `REQUIRED` |
| `plannedEmployeeDeferral` | <= maxEmployeeDeferral | `OUT_OF_RANGE` |
| `plannedEmployerContribution` | <= maxEmployerContribution | `OUT_OF_RANGE` |

---

## Disclaimer Copy

> **Estimate only — not tax advice.** Solo 401(k) plans have establishment requirements, deadlines, and annual reporting obligations for higher balances. Employee deferral limits apply across all 401(k) plans you participate in. Contributions must not exceed earned income and IRS annual limits. This calculator does not establish a plan document. Consult a retirement plan administrator or tax professional.

---

## Suggested Internal Links

- [SEP IRA Calculator](/calculators/sep-ira) — simpler alternative
- [S Corp Tax Calculator](/calculators/s-corp-tax)
- [LLC vs S Corp Calculator](/calculators/llc-vs-scorp)
- [Self Employed Tax Calculator](/calculators/self-employed-tax)

---

## Monetization Placement Notes

| Placement | Recommendation |
|---|---|
| Max contribution reveal | Solo 401k provider affiliate (Guideline, Shareworks, etc.) |
| SEP comparison banner | Internal link first, then provider |
| S Corp structure toggle | Payroll + retirement bundle partner |

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-16 | Initial specification |
