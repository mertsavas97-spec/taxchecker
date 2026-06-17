'use client';

import { useMemo, useState } from 'react';

import { BreakdownResults } from '@/components/calculator/breakdown-results';
import { DisclaimerPanel } from '@/components/calculator/disclaimer-panel';
import { NextStepsPanel } from '@/components/calculator/next-steps-panel';
import { InfoCallout } from '@/components/calculator/info-callout';
import { PrimaryResults } from '@/components/calculator/primary-results';
import { WarningPanel } from '@/components/calculator/warning-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  buildHsaBreakdownCards,
  buildHsaPrimaryCards,
} from '@/lib/calculators/result-layout';
import { FILING_STATUS_LABELS } from '@/lib/filing-status-labels';
import {
  calculateHsaTax,
  dollarsToCents,
  FILING_STATUSES,
  formatCurrency,
  type FilingStatus,
  type HsaCoverageType,
} from '@/lib/tax-engine';

const TAX_YEAR = 2025;

function parseDollarInput(value: string): number {
  const normalized = value.replace(/,/g, '').trim();
  if (normalized === '') return 0;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
}

function parseAgeInput(value: string): number {
  const normalized = value.replace(/,/g, '').trim();
  if (normalized === '') return 0;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.round(parsed));
}

function parseMonthsInput(value: string): number | undefined {
  const normalized = value.replace(/,/g, '').trim();
  if (normalized === '') return undefined;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(12, Math.max(1, Math.round(parsed)));
}

function isNegativeInput(value: string): boolean {
  const normalized = value.replace(/,/g, '').trim();
  if (normalized === '' || normalized === '-') return false;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed < 0;
}

export function HsaTaxCalculator() {
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [coverageType, setCoverageType] = useState<HsaCoverageType>('self_only');
  const [age, setAge] = useState('35');
  const [annualIncome, setAnnualIncome] = useState('85000');
  const [hsaContribution, setHsaContribution] = useState('4300');
  const [employerContribution, setEmployerContribution] = useState('0');
  const [payrollDeductedContribution, setPayrollDeductedContribution] = useState(false);
  const [eligibleMonths, setEligibleMonths] = useState('12');

  const ageInvalid = isNegativeInput(age);
  const incomeInvalid = isNegativeInput(annualIncome);
  const contributionInvalid = isNegativeInput(hsaContribution);
  const employerInvalid = isNegativeInput(employerContribution);
  const monthsInvalid = isNegativeInput(eligibleMonths);

  const result = useMemo(() => {
    const months = parseMonthsInput(eligibleMonths);

    return calculateHsaTax({
      taxYear: TAX_YEAR,
      filingStatus,
      coverageType,
      age: parseAgeInput(age),
      annualIncomeCents: dollarsToCents(parseDollarInput(annualIncome)),
      hsaContributionCents: dollarsToCents(parseDollarInput(hsaContribution)),
      employerContributionCents: dollarsToCents(parseDollarInput(employerContribution)),
      payrollDeductedContribution,
      ...(months !== undefined ? { eligibleMonths: months } : {}),
    });
  }, [
    filingStatus,
    coverageType,
    age,
    annualIncome,
    hsaContribution,
    employerContribution,
    payrollDeductedContribution,
    eligibleMonths,
  ]);

  const primary = buildHsaPrimaryCards(result.summary, result.details);
  const breakdown = buildHsaBreakdownCards(result.summary);
  const hasExcess = result.details.excessContributionCents > 0;

  return (
    <div className="space-y-5">
      <InfoCallout variant="neutral" title="HDHP eligibility not assessed">
        You must have qualifying high deductible health plan coverage to contribute to an
        HSA. This calculator does not verify plan eligibility or recommend a contribution
        amount.
      </InfoCallout>

      <InfoCallout variant="info" title="How federal savings are estimated">
        Federal savings are estimated using marginal-rate logic and may vary near tax
        bracket thresholds.
      </InfoCallout>

      {hasExcess ? (
        <InfoCallout variant="info" title="Excess contribution detected">
          Your user contribution exceeds remaining room by{' '}
          {formatCurrency(result.details.excessContributionCents)}. Excess HSA
          contributions may be subject to additional IRS tax and penalty. Review limits
          with your plan administrator and tax advisor before contributing more.
        </InfoCallout>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <Card className="shadow-tc-sm">
          <CardHeader className="pb-3">
            <p className="tc-overline">Inputs</p>
            <CardTitle className="text-base font-semibold">Your HSA details</CardTitle>
            <p className="text-sm text-muted-foreground">All amounts in U.S. dollars.</p>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => event.preventDefault()}
              aria-label="HSA tax savings calculator inputs"
            >
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="filing-status">Filing status</Label>
                <Select
                  value={filingStatus}
                  onValueChange={(value) => setFilingStatus(value as FilingStatus)}
                >
                  <SelectTrigger id="filing-status" className="w-full">
                    <SelectValue placeholder="Select filing status" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILING_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {FILING_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverage-type">Coverage type</Label>
                <Select
                  value={coverageType}
                  onValueChange={(value) =>
                    setCoverageType(value as HsaCoverageType)
                  }
                >
                  <SelectTrigger id="coverage-type" className="w-full">
                    <SelectValue placeholder="Select coverage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_only">Self-only</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  inputMode="numeric"
                  autoComplete="off"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  aria-invalid={ageInvalid}
                  aria-describedby="age-help"
                />
                <p id="age-help" className="tc-caption">
                  Used for catch-up contribution eligibility.
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="annual-income">Annual income ({TAX_YEAR})</Label>
                <Input
                  id="annual-income"
                  inputMode="decimal"
                  autoComplete="off"
                  value={annualIncome}
                  onChange={(event) => setAnnualIncome(event.target.value)}
                  aria-invalid={incomeInvalid}
                  aria-describedby="annual-income-help"
                />
                <p id="annual-income-help" className="tc-caption">
                  Ordinary income used to estimate marginal federal tax savings.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hsa-contribution">HSA contribution</Label>
                <Input
                  id="hsa-contribution"
                  inputMode="decimal"
                  autoComplete="off"
                  value={hsaContribution}
                  onChange={(event) => setHsaContribution(event.target.value)}
                  aria-invalid={contributionInvalid}
                  aria-describedby="hsa-contribution-help"
                />
                <p id="hsa-contribution-help" className="tc-caption">
                  Your planned contribution—not a recommended amount.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employer-contribution">
                  Employer contribution (optional)
                </Label>
                <Input
                  id="employer-contribution"
                  inputMode="decimal"
                  autoComplete="off"
                  value={employerContribution}
                  onChange={(event) => setEmployerContribution(event.target.value)}
                  aria-invalid={employerInvalid}
                  aria-describedby="employer-contribution-help"
                />
                <p id="employer-contribution-help" className="tc-caption">
                  Employer HSA funding counts toward the annual limit.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eligible-months">Eligible months (optional)</Label>
                <Input
                  id="eligible-months"
                  inputMode="numeric"
                  autoComplete="off"
                  value={eligibleMonths}
                  onChange={(event) => setEligibleMonths(event.target.value)}
                  aria-invalid={monthsInvalid}
                  aria-describedby="eligible-months-help"
                />
                <p id="eligible-months-help" className="tc-caption">
                  Months of HSA eligibility in {TAX_YEAR} (1–12). Defaults to 12.
                </p>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <input
                  id="payroll-deducted"
                  type="checkbox"
                  checked={payrollDeductedContribution}
                  onChange={(event) =>
                    setPayrollDeductedContribution(event.target.checked)
                  }
                  className="mt-1 size-4 rounded border border-input"
                />
                <div className="space-y-1">
                  <Label htmlFor="payroll-deducted" className="font-medium">
                    Payroll-deducted contribution
                  </Label>
                  <p className="tc-caption">
                    Check if your HSA contribution is made through employer payroll on a
                    pre-tax basis to estimate FICA savings.
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <PrimaryResults
          items={primary}
          taxYear={TAX_YEAR}
          title="Estimated savings"
          description="Estimated savings are based only on your inputs—not tax or benefits advice."
        />
      </div>

      <BreakdownResults
        items={breakdown}
        description="Contribution limits, room, excess amount, and marginal federal rate used."
      />

      <WarningPanel warnings={result.warnings} />

      <DisclaimerPanel disclaimer={result.disclaimer} />

      <NextStepsPanel journeyId="hsa-tax" />

      <InfoCallout variant="neutral" title="Privacy">
        Calculations run locally in your browser. Nothing is sent to a server or
        stored.
      </InfoCallout>
    </div>
  );
}
