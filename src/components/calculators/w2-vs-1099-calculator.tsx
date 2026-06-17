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
  applyPrimaryLabelOverrides,
  buildW2Vs1099BreakdownCards,
  partitionResultCards,
  W2_VS_1099_PRIMARY_LABEL_OVERRIDES,
  W2_VS_1099_PRIMARY_RESULT_IDS,
} from '@/lib/calculators/result-layout';
import { FILING_STATUS_LABELS } from '@/lib/filing-status-labels';
import {
  calculateW2Vs1099,
  dollarsToCents,
  FILING_STATUSES,
  type FilingStatus,
} from '@/lib/tax-engine';

const TAX_YEAR = 2025;

function parseDollarInput(value: string): number {
  const normalized = value.replace(/,/g, '').trim();
  if (normalized === '') return 0;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
}

function parseHoursInput(value: string): number | undefined {
  const normalized = value.replace(/,/g, '').trim();
  if (normalized === '') return undefined;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(0, Math.round(parsed));
}

function isNegativeInput(value: string): boolean {
  const normalized = value.replace(/,/g, '').trim();
  if (normalized === '' || normalized === '-') return false;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed < 0;
}

export function W2Vs1099Calculator() {
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [w2Salary, setW2Salary] = useState('100000');
  const [contractorGrossIncome, setContractorGrossIncome] = useState('120000');
  const [contractorBusinessExpenses, setContractorBusinessExpenses] = useState('10000');
  const [w2FederalWithholding, setW2FederalWithholding] = useState('0');
  const [annualBenefitsValue, setAnnualBenefitsValue] = useState('12000');
  const [contractorExtraCosts, setContractorExtraCosts] = useState('5000');
  const [hoursPerYear, setHoursPerYear] = useState('2000');

  const w2SalaryInvalid = isNegativeInput(w2Salary);
  const contractorGrossInvalid = isNegativeInput(contractorGrossIncome);
  const expensesInvalid = isNegativeInput(contractorBusinessExpenses);
  const withholdingInvalid = isNegativeInput(w2FederalWithholding);
  const benefitsInvalid = isNegativeInput(annualBenefitsValue);
  const extraCostsInvalid = isNegativeInput(contractorExtraCosts);
  const hoursInvalid = isNegativeInput(hoursPerYear);

  const result = useMemo(() => {
    const hours = parseHoursInput(hoursPerYear);

    return calculateW2Vs1099({
      taxYear: TAX_YEAR,
      filingStatus,
      w2SalaryCents: dollarsToCents(parseDollarInput(w2Salary)),
      contractorGrossIncomeCents: dollarsToCents(parseDollarInput(contractorGrossIncome)),
      contractorBusinessExpensesCents: dollarsToCents(
        parseDollarInput(contractorBusinessExpenses),
      ),
      w2FederalWithholdingCents: dollarsToCents(parseDollarInput(w2FederalWithholding)),
      annualBenefitsValueCents: dollarsToCents(parseDollarInput(annualBenefitsValue)),
      contractorExtraCostsCents: dollarsToCents(parseDollarInput(contractorExtraCosts)),
      ...(hours !== undefined && hours > 0 ? { hoursPerYear: hours } : {}),
    });
  }, [
    filingStatus,
    w2Salary,
    contractorGrossIncome,
    contractorBusinessExpenses,
    w2FederalWithholding,
    annualBenefitsValue,
    contractorExtraCosts,
    hoursPerYear,
  ]);

  const { primary } = partitionResultCards(
    result.summary,
    W2_VS_1099_PRIMARY_RESULT_IDS,
  );
  const primaryDisplay = applyPrimaryLabelOverrides(
    primary,
    W2_VS_1099_PRIMARY_LABEL_OVERRIDES,
  );
  const breakdown = buildW2Vs1099BreakdownCards(result.summary);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <Card className="shadow-tc-sm">
          <CardHeader className="pb-3">
            <p className="tc-overline">Inputs</p>
            <CardTitle className="text-base font-semibold">Compare scenarios</CardTitle>
            <p className="text-sm text-muted-foreground">All amounts in U.S. dollars.</p>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => event.preventDefault()}
              aria-label="W-2 vs 1099 calculator inputs"
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
                <Label htmlFor="w2-salary">W-2 salary ({TAX_YEAR})</Label>
                <Input
                  id="w2-salary"
                  inputMode="decimal"
                  autoComplete="off"
                  value={w2Salary}
                  onChange={(event) => setW2Salary(event.target.value)}
                  aria-invalid={w2SalaryInvalid}
                  aria-describedby="w2-salary-help"
                />
                <p id="w2-salary-help" className="tc-caption">
                  Annual gross W-2 wages before employee FICA.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor-gross">Contractor gross income ({TAX_YEAR})</Label>
                <Input
                  id="contractor-gross"
                  inputMode="decimal"
                  autoComplete="off"
                  value={contractorGrossIncome}
                  onChange={(event) => setContractorGrossIncome(event.target.value)}
                  aria-invalid={contractorGrossInvalid}
                  aria-describedby="contractor-gross-help"
                />
                <p id="contractor-gross-help" className="tc-caption">
                  Gross 1099 income before business expenses.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor-expenses">
                  Contractor business expenses (optional)
                </Label>
                <Input
                  id="contractor-expenses"
                  inputMode="decimal"
                  autoComplete="off"
                  value={contractorBusinessExpenses}
                  onChange={(event) =>
                    setContractorBusinessExpenses(event.target.value)
                  }
                  aria-invalid={expensesInvalid}
                  aria-describedby="contractor-expenses-help"
                />
                <p id="contractor-expenses-help" className="tc-caption">
                  Deductible business expenses tied to contractor work.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="w2-withholding">
                  W-2 federal withholding (optional)
                </Label>
                <Input
                  id="w2-withholding"
                  inputMode="decimal"
                  autoComplete="off"
                  value={w2FederalWithholding}
                  onChange={(event) => setW2FederalWithholding(event.target.value)}
                  aria-invalid={withholdingInvalid}
                  aria-describedby="w2-withholding-help"
                />
                <p id="w2-withholding-help" className="tc-caption">
                  Expected annual federal tax withheld from W-2 paychecks.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annual-benefits">
                  Annual benefits value (optional)
                </Label>
                <Input
                  id="annual-benefits"
                  inputMode="decimal"
                  autoComplete="off"
                  value={annualBenefitsValue}
                  onChange={(event) => setAnnualBenefitsValue(event.target.value)}
                  aria-invalid={benefitsInvalid}
                  aria-describedby="annual-benefits-help"
                />
                <p id="annual-benefits-help" className="tc-caption">
                  Employer-paid health, retirement, PTO, or other annual benefits.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor-extra-costs">
                  Contractor extra costs (optional)
                </Label>
                <Input
                  id="contractor-extra-costs"
                  inputMode="decimal"
                  autoComplete="off"
                  value={contractorExtraCosts}
                  onChange={(event) => setContractorExtraCosts(event.target.value)}
                  aria-invalid={extraCostsInvalid}
                  aria-describedby="contractor-extra-costs-help"
                />
                <p id="contractor-extra-costs-help" className="tc-caption">
                  Insurance, admin, or other annual contractor-only costs.
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="hours-per-year">Hours per year (optional)</Label>
                <Input
                  id="hours-per-year"
                  inputMode="numeric"
                  autoComplete="off"
                  value={hoursPerYear}
                  onChange={(event) => setHoursPerYear(event.target.value)}
                  aria-invalid={hoursInvalid}
                  aria-describedby="hours-per-year-help"
                />
                <p id="hours-per-year-help" className="tc-caption">
                  Used to estimate break-even contractor hourly rate.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <PrimaryResults
          items={primaryDisplay}
          taxYear={TAX_YEAR}
          title="Comparison summary"
          description="Higher estimated value is based only on the inputs above—not employment or tax advice."
        />
      </div>

      <BreakdownResults
        items={breakdown}
        description="After-tax income, break-even metrics, FICA, self-employment tax, benefits, and contractor costs."
      />

      <WarningPanel warnings={result.warnings} />

      <DisclaimerPanel disclaimer={result.disclaimer} />

      <NextStepsPanel journeyId="w2-vs-1099" />

      <InfoCallout variant="neutral" title="Privacy">
        Calculations run locally in your browser. Nothing is sent to a server or
        stored.
      </InfoCallout>
    </div>
  );
}
