# HSA Tax Savings Calculator — Specification

**Calculator ID:** `hsa-tax-savings`  
**Route (future):** `/calculators/hsa-tax`  
**Engine module:** `src/lib/tax-engine/calculators/hsa-tax-savings.ts`  
**TaxChecker version:** 1.0

---

## Purpose

Estimate **federal income tax savings** from contributing to a Health Savings Account (HSA), given coverage type, age, planned contribution, and estimated marginal tax rate derived from user income inputs. Shows maximum allowable contribution and tax benefit.

---

## Target User

- HDHP participants (employer or self-employed)
- Self-employed individuals evaluating HSA vs other deductions
- Open enrollment planners
- Users searching "HSA tax savings calculator"

---

## SEO Intent

| Element | Value |
|---|---|
| **Primary keyword** | HSA tax savings calculator |
| **Secondary keywords** | HSA contribution calculator, HSA tax deduction calculator, health savings account tax benefit, HSA limits 20xx |
| **Search intent** | Informational — quantify tax benefit of HSA contributions |
| **Title tag (future)** | HSA Tax Savings Calculator — Contribution Limits & Deduction \| TaxChecker |

---

## Required Inputs

| Field | Type | Description |
|---|---|---|
| `taxYear` | `number` | Tax year |
| `filingStatus` | `FilingStatus` | For marginal rate estimation |
| `coverageType` | `'self_only' \| 'family'` | HDHP coverage level |
| `plannedContribution` | `Cents` | Amount user plans to contribute |

---

## Optional Inputs

| Field | Type | Default | Description |
|---|---|---|---|
| `age` | `number` | `null` | For catch-up contribution (55+) |
| `estimatedTaxableIncome` | `Cents` | `null` | If null, derive from income fields |
| `netBusinessProfit` | `Cents` | `0` | For marginal rate derivation |
| `w2Wages` | `Cents` | `0` | For marginal rate derivation |
| `otherIncome` | `Cents` | `0` | For marginal rate derivation |
| `contributionViaPayroll` | `boolean` | `false` | If true, note FICA savings potential (S Corp / W-2) |
| `monthsEligible` | `number` | `12` | Partial-year HDHP (1-12) |

---

## Outputs

| Output | Type | Description |
|---|---|---|
| `annualLimit` | `Cents` | Max HSA contribution for coverage type |
| `catchUpContribution` | `Cents` | Additional if age >= catchUpAge |
| `maxAllowableContribution` | `Cents` | Limit after catch-up and proration |
| `allowableContribution` | `Cents` | min(planned, maxAllowable) |
| `marginalFederalRate` | `number` | Rate used for savings calc |
| `federalIncomeTaxSavings` | `Cents` | allowable × marginalRate |
| `ficaSavings` | `Cents` | 0 in default; computed if contributionViaPayroll |
| `totalTaxSavings` | `Cents` | federal + FICA if applicable |

---

## Result Cards

| Card ID | Label | Value source | Variant |
|---|---|---|---|
| `tax-savings` | Estimated Federal Tax Savings | `federalIncomeTaxSavings` | `savings` |
| `max-contribution` | Maximum HSA Contribution | `maxAllowableContribution` | `highlight` |
| `your-contribution` | Your Planned Contribution | `allowableContribution` | `default` |
| `marginal-rate` | Marginal Federal Tax Rate | `marginalFederalRate` | `default` (percent) |
| `fica-savings` | Additional FICA Savings | `ficaSavings` | `savings` (if applicable) |

---

## Formula Dependencies

```
baseLimit = coverageType === 'family' ? config.hsa.familyLimit : config.hsa.selfOnlyLimit
catchUp = age >= config.hsa.catchUpAge ? config.hsa.catchUpAmount : 0
proratedLimit = (baseLimit + catchUp) × (monthsEligible / 12)  // TODO_VERIFY proration rules Pub 969
maxAllowableContribution = proratedLimit
allowableContribution = min(plannedContribution, maxAllowableContribution)

marginalRate = deriveMarginalRate(estimatedTaxableIncome OR income pipeline, filingStatus)
federalIncomeTaxSavings = round(allowableContribution × marginalRate)

if contributionViaPayroll:
  ficaSavings = allowableContribution × (SS rate + Medicare rate)  // employee portion TODO_VERIFY
```

**Engine modules:** `hsa`, `federal-income-tax` (marginal rate), optionally `payroll-tax`

---

## IRS / Public References

- [Publication 969 — Health Savings Accounts](https://www.irs.gov/publications/p969)
- [Rev. Proc. annual limits](https://www.irs.gov/newsroom) — HSA section
- [Form 8889](https://www.irs.gov/forms-pubs/about-form-8889) — context for contributions/deductions

---

## Assumptions

1. User has qualifying HDHP coverage — eligibility checkbox required in UI.
2. No other HSA contributions from employer (or user enters employer contribution as reduction to limit — optional v1.1).
3. Marginal rate from federal ordinary income brackets only.
4. FICA savings only when `contributionViaPayroll = true` (Section 125 cafeteria / payroll deduction).
5. Contribution is deductible above-the-line (not itemized).
6. No state tax savings in 1.0.

---

## Exclusions

- HDHP qualification verification (deductible minimums — TODO_VERIFY; display as reference text only)
- Employer HSA contributions (unless future input added)
- Excess contribution penalty (6%)
- Medicare enrollment interaction (age 65+)
- State income tax treatment
- Family coverage member details

---

## Edge Cases

| Case | Handling |
|---|---|
| plannedContribution > limit | Cap at max; warning |
| age < 55 | catchUp = 0 |
| monthsEligible < 12 | Prorate limit |
| No income provided | Require estimatedTaxableIncome or show error |
| contributionViaPayroll + self-employed sole prop | FICA savings = 0; note "payroll only" |

---

## Validation Rules

| Field | Rule | Error code |
|---|---|---|
| `plannedContribution` | >= 0 | `OUT_OF_RANGE` |
| `age` | 0-120 if provided | `OUT_OF_RANGE` |
| `monthsEligible` | 1-12 | `OUT_OF_RANGE` |
| `coverageType` | enum | `REQUIRED` |
| Eligibility | UI attestation required | `REQUIRED` (hsaEligible: true) |

---

## Disclaimer Copy

> **Estimate only — not tax advice.** You must have a qualifying High Deductible Health Plan to contribute to an HSA. Contribution limits change annually and may be reduced by employer contributions. This calculator estimates federal income tax savings only and does not determine HDHP eligibility. Consult your health plan administrator and tax advisor. See [Publication 969](https://www.irs.gov/publications/p969).

---

## Suggested Internal Links

- [Self Employed Tax Calculator](/calculators/self-employed-tax)
- [S Corp Tax Calculator](/calculators/s-corp-tax) — payroll HSA
- [SEP IRA Calculator](/calculators/sep-ira)
- [Solo 401(k) Calculator](/calculators/solo-401k)

---

## Monetization Placement Notes

| Placement | Recommendation |
|---|---|
| After savings result | HSA provider / brokerage affiliate (Fidelity, Lively, etc.) |
| Open enrollment season | HDHP insurance comparison (careful compliance) |
| Low savings | Educational content link, not aggressive upsell |

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-16 | Initial specification |
