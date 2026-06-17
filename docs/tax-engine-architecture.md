# Tax Engine Architecture — TaxChecker 1.0

This document defines the server-portable calculation layer for TaxChecker.app. All calculator logic lives under `src/lib/tax-engine/` and must be callable without React, Next.js request context, or browser APIs.

**Principles**

1. **Pure functions** — Given validated inputs and a `TaxYearConfig`, calculators return deterministic outputs.
2. **Config-driven constants** — No magic numbers in calculator files; all IRS values come from verified year config.
3. **Composable modules** — Shared tax math is implemented once in `core/` and composed by `calculators/`.
4. **Estimate-only** — Outputs are labeled estimates; engine does not produce filing-ready forms.

---

## Constants Verification Gate (mandatory)

**No calculator may ship to production if any constant it requires is marked unverified.**

### Rules

1. Every numeric value in `config/tax-year-YYYY.ts` must trace to `docs/irs/verified-constants-YYYY.md` with source title, URL, tax year, and date accessed.
2. `TaxYearConfig.verifiedAt` must be a non-null ISO date before the config is enabled in production builds.
3. If a calculator depends on a value listed in `docs/irs/verification-gaps.md` as 🔶 **Algorithm** without implemented worksheet logic, that calculator **cannot ship**.
4. CI (future) must fail if `getTaxYearConfig(year).verifiedAt === null` when `NODE_ENV === 'production'`.
5. Unverified placeholders remain `TODO_VERIFY_WITH_CURRENT_IRS_SOURCE` in stub configs only — never in release tags.

### Verification documents

| Document | Purpose |
|---|---|
| `docs/irs/verified-constants-2025.md` | Verified numeric constants for tax year 2025 |
| `docs/irs/verification-gaps.md` | Worksheet logic, scope exclusions, unresolved items |
| `docs/irs/sources.md` | Primary source registry and checklist |

### 2025 status (2026-06-16)

- **Core income/SE/payroll/estimated/HSA constants:** ✅ verified
- **SEP / Solo 401(k) compensation worksheet:** 🔶 algorithm gap — blocks retirement calculator release until implemented
- **Additional Medicare W-2 + SE coordination:** 🔶 algorithm gap — required for high-income accuracy

---

## Folder Architecture

```
src/lib/tax-engine/
├── index.ts                    # Public API barrel — calculators + types only
├── types/
│   ├── filing-status.ts        # FilingStatus enum/type
│   ├── money.ts                # Money, RoundingMode, CurrencyFormatOptions
│   ├── inputs.ts               # Shared input shapes (income, deductions, etc.)
│   ├── outputs.ts              # CalculatorResult, ResultCard, BreakdownLine
│   └── validation.ts           # ValidationError, ValidationResult
├── config/
│   ├── tax-year-config.ts      # TaxYearConfig interface
│   ├── tax-year-2025.ts        # Verified constants — see docs/irs/verified-constants-2025.md
│   └── index.ts                # getTaxYearConfig(year): TaxYearConfig
├── core/
│   ├── federal-income-tax.ts   # Bracket traversal, taxable income
│   ├── self-employment-tax.ts  # Schedule SE logic
│   ├── payroll-tax.ts          # W-2 FICA (employee + employer for S Corp)
│   ├── estimated-tax.ts        # Annual liability, quarterly split, safe harbor
│   ├── retirement/
│   │   ├── sep-ira.ts
│   │   ├── solo-401k.ts
│   │   └── shared.ts           # Compensation definition, limit helpers
│   ├── hsa.ts                  # Limits, tax savings from contributions
│   ├── business-entity.ts      # LLC vs S Corp comparison orchestration
│   ├── deductions.ts           # Standard deduction, SE tax deduction (50%)
│   └── rounding.ts             # Central rounding utilities
├── calculators/
│   ├── self-employed-tax.ts
│   ├── tax-1099.ts
│   ├── quarterly-tax.ts
│   ├── estimated-tax.ts
│   ├── w2-vs-1099.ts
│   ├── s-corp-tax.ts
│   ├── llc-vs-s-corp.ts
│   ├── hsa-tax-savings.ts
│   ├── sep-ira.ts
│   └── solo-401k.ts
└── tests/
    ├── fixtures/               # Golden-file inputs/outputs per calculator
    ├── core/                   # Unit tests for core modules
    └── calculators/            # Integration tests per calculator
```

### Dependency direction (strict)

```
calculators/ → core/ → config/ + types/
```

`calculators/` must not import other `calculators/` directly. Shared orchestration belongs in `core/` (e.g., `business-entity.ts`).

---

## Core Domain Models

### `Money`

Represent monetary values as **integer cents** internally (`type Cents = number`) to avoid floating-point drift. Display formatting happens at the UI boundary.

```typescript
// types/money.ts (spec — not implemented)
type Cents = number;

interface Money {
  cents: Cents;
}
```

### `TaxYearConfig`

Single source of truth for all IRS constants for a given tax year.

```typescript
interface TaxYearConfig {
  year: number;
  verifiedAt: string | null;       // ISO date; null if unverified
  sourceNotes: string;             // Link to docs/irs/sources.md verification

  federalIncomeTax: {
    brackets: Record<FilingStatus, TaxBracket[]>;
  };

  standardDeduction: Record<FilingStatus, Cents>;

  selfEmploymentTax: {
    netEarningsFactor: number;     // 0.9235 — verified 2025 (Topic 554)
    socialSecurityRate: number;
    medicareRate: number;
    socialSecurityWageBase: Cents;
    deductiblePortionRate: number; // 0.5 — verified 2025 (Topic 554)
  };

  additionalMedicareTax: {
    rate: number;
    thresholds: Record<FilingStatus, Cents>;
  };

  payrollTax: {
    socialSecurityRateEmployee: number;
    medicareRateEmployee: number;
    socialSecurityRateEmployer: number;
    medicareRateEmployer: number;
    socialSecurityWageBase: Cents;
  };

  estimatedTax: {
    safeHarborCurrentYearRate: number;   // 0.9 — verified 2025 (Form 1040-ES)
    safeHarborPriorYearRate: number;     // 1.0 — verified 2025
    safeHarborPriorYearHighAGIRate: number; // 1.1 — verified 2025
    safeHarborHighAGIThreshold: Cents;   // $150,000 — verified 2025
    quarterlyDueDates: [string, string, string, string]; // ISO dates — verified 2025
  };

  hsa: {
    selfOnlyLimit: Cents;
    familyLimit: Cents;
    catchUpAge: number;
    catchUpAmount: Cents;
  };

  sepIra: {
    maxContribution: Cents;
    compensationRate: number;        // 0.25 — verified 2025
  };

  solo401k: {
    employeeDeferralLimit: Cents;
    catchUpAge: number;
    catchUpAmount: Cents;
    totalAnnualAdditionLimit: Cents; // 415(c) — verified 2025 ($70,000)
    employerCompensationRate: number;  // 0.25 — verified 2025
    annualCompensationLimit: Cents;    // 401(a)(17) — verified 2025 ($350,000)
  };
}

interface TaxBracket {
  min: Cents;          // inclusive lower bound
  max: Cents | null;   // inclusive upper; null = no cap
  rate: number;        // e.g. 0.22
}
```

### `FilingStatus`

```typescript
type FilingStatus =
  | 'single'
  | 'married_filing_jointly'
  | 'married_filing_separately'
  | 'head_of_household'
  | 'qualifying_surviving_spouse';
```

Maps to IRS Form 1040 filing status. `qualifying_surviving_spouse` uses MFJ brackets and standard deduction per IRS rules (TODO_VERIFY bracket assignment annually).

---

## Module Specifications

### Federal Bracket Calculation (`core/federal-income-tax.ts`)

**Inputs:** `taxableIncome: Cents`, `filingStatus: FilingStatus`, `config: TaxYearConfig`

**Output:** `FederalIncomeTaxResult`

```typescript
interface FederalIncomeTaxResult {
  taxableIncome: Cents;
  tax: Cents;
  marginalRate: number;
  effectiveRate: number;
  bracketBreakdown: Array<{
    bracket: TaxBracket;
    taxableInBracket: Cents;
    taxInBracket: Cents;
  }>;
}
```

**Algorithm:** Progressive bracket walk — for each bracket, compute taxable amount in bracket × rate. Sum bracket taxes. Marginal rate = rate of bracket containing last dollar. Effective rate = tax / taxableIncome.

**Edge cases:** Zero or negative taxable income → tax = 0. Negative taxable income is clamped to 0 with validation warning.

---

### Self-Employment Tax (`core/self-employment-tax.ts`)

**Inputs:** `netProfit: Cents`, `w2WagesSubjectToSS: Cents` (for wage base coordination), `filingStatus`, `config`

**Output:** `SelfEmploymentTaxResult`

```typescript
interface SelfEmploymentTaxResult {
  netProfit: Cents;
  netEarnings: Cents;              // netProfit × netEarningsFactor
  socialSecurityTax: Cents;
  medicareTax: Cents;
  additionalMedicareTax: Cents;
  totalSETax: Cents;
  deductibleSETax: Cents;          // 50% for AGI adjustment
}
```

**Wage base coordination:** Social Security portion applies only to remaining wage base after W-2 wages (Schedule SE coordination — TODO_VERIFY formula against Schedule SE).

---

### Estimated Tax (`core/estimated-tax.ts`)

**Inputs:** `annualTaxLiability: Cents`, `withholdingAndCredits: Cents`, `priorYearTax: Cents | null`, `priorYearAGI: Cents | null`, `config`

**Output:** `EstimatedTaxResult`

```typescript
interface EstimatedTaxResult {
  annualEstimatedLiability: Cents;
  totalRequiredAnnual: Cents;      // after safe harbor logic
  quarterlyPayment: Cents;         // equal split default
  quarterlyPayments: [Cents, Cents, Cents, Cents];
  dueDates: [string, string, string, string];
  safeHarborMet: boolean;
  safeHarborMethod: 'current_year_90' | 'prior_year_100' | 'prior_year_110' | 'none';
  underpaymentRisk: boolean;       // informational flag; penalty calc v2
}
```

**1.0 scope:** Equal quarterly installments. Annualization method deferred.

---

### Retirement Contribution (`core/retirement/`)

**Shared (`shared.ts`):**

- `computeSelfEmploymentCompensation(netProfit, deductibleSETax)` per Pub 560 worksheet (TODO_VERIFY)
- `applyContributionLimit(requested, limit): Cents`

**SEP IRA (`sep-ira.ts`):**

- `maxSepContribution(compensation, config)`
- Tax savings = federal tax on contribution amount at marginal rate (or effective rate — document in calculator; use marginal for conservative estimate)

**Solo 401(k) (`solo-401k.ts`):**

- Employee deferral capped by deferral limit (+ catch-up)
- Employer profit-sharing = min(25% × compensation, remaining room under 415(c) limit after deferral)
- Return contribution breakdown + tax savings

---

### HSA (`core/hsa.ts`)

**Inputs:** `coverageType: 'self_only' | 'family'`, `age`, `plannedContribution: Cents`, `federalMarginalRate`, `config`

**Output:** limit, allowable contribution, federal tax savings, (optional) FICA savings if via payroll — 1.0 assumes personal contribution FICA savings **excluded** unless via S Corp payroll (document in HSA calculator).

---

### Business Entity Comparison (`core/business-entity.ts`)

Orchestrates side-by-side:

1. **LLC / sole prop path:** net profit → SE tax → SE tax deduction → taxable income → income tax
2. **S Corp path:** user salary → employer+employee FICA on salary → remaining profit as distribution (not subject to SE tax) → income tax on total income

**Output:** `EntityComparisonResult` with per-entity tax components and net savings.

Reasonable compensation is user input, not engine-derived.

---

## Shared Output Model

All calculators return a consistent envelope:

```typescript
interface CalculatorResult<TDetails> {
  calculatorId: string;
  taxYear: number;
  computedAt: string;              // ISO timestamp
  disclaimer: string;              // Standard disclaimer key
  summary: ResultCard[];
  details: TDetails;
  breakdown: BreakdownLine[];
  warnings: string[];
  metadata: {
    engineVersion: string;
    configVerified: boolean;
  };
}

interface ResultCard {
  id: string;
  label: string;
  value: Cents;
  format: 'currency' | 'percent';
  variant: 'default' | 'highlight' | 'savings' | 'liability';
  tooltip?: string;
}

interface BreakdownLine {
  id: string;
  label: string;
  amount: Cents;
  indent?: number;
  category: 'income' | 'deduction' | 'tax' | 'contribution' | 'informational';
}
```

---

## Rounding Rules

| Rule | Policy |
|---|---|
| Internal arithmetic | Integer cents only |
| Rate multiplication | `Math.round(cents * rate)` per operation unless otherwise specified |
| Bracket tax | Round per bracket, then sum |
| SE tax | Round final SS and Medicare components per Schedule SE (TODO_VERIFY — typically round to nearest cent at each component) |
| Quarterly split | `quarterly = Math.floor(annual / 4)`; remainder cents added to Q1 (document in UI) |
| Display | Round to whole dollars optional in UI; engine always returns cents |
| Percent display | 1 decimal place for effective rates; 2 for marginal rates if shown |

---

## Currency Formatting Rules

Formatting is a **presentation concern** but conventions are fixed for consistency:

```typescript
interface CurrencyFormatOptions {
  locale: 'en-US';
  currency: 'USD';
  minimumFractionDigits: 0 | 2;  // default 0 for summary cards, 2 for breakdown tables
  maximumFractionDigits: 0 | 2;
  accountingNegative: boolean;    // default false; use prefix "-" not parentheses
}
```

- Use `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` at UI layer.
- Never format inside core modules.
- Percentages: `12.4%` not `0.124`.

---

## Validation Strategy

### Layers

1. **Schema validation (Zod)** — At calculator entry: types, ranges, required fields. Lives in `types/` or co-located `*.schema.ts` files consumed by API routes later.
2. **Domain validation** — In core modules: business rules (e.g., salary cannot exceed net profit).
3. **Config guard** — Refuse to calculate if `config.verifiedAt === null` in production mode. Refuse to enable a calculator if required constants are listed as algorithm gaps in `docs/irs/verification-gaps.md` without implemented worksheet logic.

### `ValidationResult`

```typescript
interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    code: string;
    message: string;
  }>;
}
```

### Standard error codes

| Code | Meaning |
|---|---|
| `REQUIRED` | Missing required input |
| `OUT_OF_RANGE` | Numeric bounds violated |
| `INCONSISTENT` | Cross-field logic failure (salary > profit) |
| `UNSUPPORTED_YEAR` | No TaxYearConfig for requested year |
| `UNVERIFIED_CONFIG` | Config not verified for production |

---

## Unit Test Strategy

### Framework

Vitest (align with Next.js project when implemented).

### Test categories

1. **Core module tests** — Bracket boundaries, wage base edge, SE tax at exactly wage base, Additional Medicare threshold.
2. **Golden-file calculator tests** — JSON fixtures in `tests/fixtures/` with hand-verified expected outputs traced to IRS worksheet examples.
3. **Regression tests** — One fixture per calculator minimum; add when bugs are found.
4. **Config tests** — Assert all `FilingStatus` keys present; bracket continuity (no gaps/overlaps).

### Fixture documentation

Each fixture file includes:

```json
{
  "source": "Schedule SE 2024 Example (page X)",
  "verified": false,
  "notes": "TODO_VERIFY_WITH_CURRENT_IRS_SOURCE"
}
```

### CI policy

- `tax-engine` tests run on every PR touching `src/lib/tax-engine/`.
- Calculators fail CI if `TODO_VERIFY` fixtures are the only coverage for a release tag.

---

## Future State Tax Extension Strategy

### Design constraints (build now)

- `TaxYearConfig` includes `stateIncomeTax: null` placeholder.
- Federal calculators accept optional `stateCode?: USStateCode` but ignore it in 1.0.
- `FederalIncomeTaxResult` and shared outputs use `jurisdiction: 'federal'` on breakdown lines.

### Future module layout

```
src/lib/tax-engine/
├── config/
│   └── states/
│       ├── index.ts
│       ├── ca-2025.ts
│       └── ...
└── core/
    └── state-income-tax.ts
```

### State config shape (future)

```typescript
interface StateTaxYearConfig {
  stateCode: string;
  brackets: Record<FilingStatus, TaxBracket[]>;
  standardDeduction?: Record<FilingStatus, Cents>;
  specialRules?: Record<string, unknown>;  // e.g. CA mental health tax
}
```

### Sourcing

State constants require separate verification registry (`docs/irs/sources.md` → `docs/state/sources.md` future). No state constants without primary state revenue department source.

---

## Public API Surface (`index.ts`)

Export only:

- Calculator functions: `calculateSelfEmployedTax(...)`, etc.
- Types needed by UI: inputs, `CalculatorResult`, `FilingStatus`
- `getTaxYearConfig(year)`
- `validate*Input(...)` helpers

Do **not** export internal core modules to UI — UI imports from `@/lib/tax-engine` barrel only.

---

## Versioning

- Engine semver in `metadata.engineVersion`.
- Breaking input/output changes require major version bump.
- New tax year config is a minor addition if interfaces unchanged.

---

## Change Log

| Date | Change |
|---|---|
| 2026-06-16 | Initial architecture spec for TaxChecker 1.0 |
| 2026-06-16 | Added mandatory constants verification gate; 2025 verification status |
