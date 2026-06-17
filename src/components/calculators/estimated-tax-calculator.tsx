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
  buildEstimatedBreakdownCards,
  ESTIMATED_PRIMARY_LABEL_OVERRIDES,
  ESTIMATED_PRIMARY_RESULT_IDS,
  partitionResultCards,
} from '@/lib/calculators/result-layout';
import { FILING_STATUS_LABELS } from '@/lib/filing-status-labels';
import {
  calculateEstimatedTax,
  dollarsToCents,
  FILING_STATUSES,
  type EstimatedTaxIncomeType,
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

function isNegativeInput(value: string): boolean {
  const normalized = value.replace(/,/g, '').trim();
  if (normalized === '' || normalized === '-') return false;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed < 0;
}

export function EstimatedTaxCalculator() {
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [incomeType, setIncomeType] = useState<EstimatedTaxIncomeType>('self_employed');
  const [netSelfEmploymentIncome, setNetSelfEmploymentIncome] = useState('75000');
  const [w2Wages, setW2Wages] = useState('0');
  const [federalWithholding, setFederalWithholding] = useState('0');
  const [otherIncome, setOtherIncome] = useState('0');
  const [estimatedPaymentsMade, setEstimatedPaymentsMade] = useState('0');
  const [priorYearTax, setPriorYearTax] = useState('0');
  const [priorYearAgi, setPriorYearAgi] = useState('0');

  const netSeInvalid = isNegativeInput(netSelfEmploymentIncome);
  const w2Invalid = isNegativeInput(w2Wages);
  const withholdingInvalid = isNegativeInput(federalWithholding);
  const otherIncomeInvalid = isNegativeInput(otherIncome);
  const paymentsInvalid = isNegativeInput(estimatedPaymentsMade);
  const priorYearTaxInvalid = isNegativeInput(priorYearTax);
  const priorYearAgiInvalid = isNegativeInput(priorYearAgi);

  const isMixed = incomeType === 'mixed';

  const result = useMemo(() => {
    return calculateEstimatedTax({
      taxYear: TAX_YEAR,
      filingStatus,
      incomeType,
      netSelfEmploymentIncomeCents: dollarsToCents(
        parseDollarInput(netSelfEmploymentIncome),
      ),
      w2WagesCents: dollarsToCents(parseDollarInput(w2Wages)),
      federalWithholdingCents: dollarsToCents(parseDollarInput(federalWithholding)),
      otherIncomeCents: dollarsToCents(parseDollarInput(otherIncome)),
      estimatedPaymentsMadeCents: dollarsToCents(
        parseDollarInput(estimatedPaymentsMade),
      ),
      priorYearTaxCents: dollarsToCents(parseDollarInput(priorYearTax)),
      priorYearAdjustedGrossIncomeCents: dollarsToCents(parseDollarInput(priorYearAgi)),
    });
  }, [
    filingStatus,
    incomeType,
    netSelfEmploymentIncome,
    w2Wages,
    federalWithholding,
    otherIncome,
    estimatedPaymentsMade,
    priorYearTax,
    priorYearAgi,
  ]);

  const { primary: primaryCards } = partitionResultCards(
    result.summary,
    ESTIMATED_PRIMARY_RESULT_IDS,
  );
  const primary = applyPrimaryLabelOverrides(
    primaryCards,
    ESTIMATED_PRIMARY_LABEL_OVERRIDES,
  );
  const breakdown = buildEstimatedBreakdownCards(result.summary, result.details);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <Card className="shadow-tc-sm">
          <CardHeader className="pb-3">
            <p className="tc-overline">Inputs</p>
            <CardTitle className="text-base font-semibold">Your tax details</CardTitle>
            <p className="text-sm text-muted-foreground">All amounts in U.S. dollars.</p>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => event.preventDefault()}
              aria-label="Estimated tax calculator inputs"
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

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="income-type">Income type</Label>
                <Select
                  value={incomeType}
                  onValueChange={(value) =>
                    setIncomeType(value as EstimatedTaxIncomeType)
                  }
                >
                  <SelectTrigger id="income-type" className="w-full">
                    <SelectValue placeholder="Select income type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self_employed">Self-employed only</SelectItem>
                    <SelectItem value="mixed">Mixed (W-2 + self-employment)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="tc-caption">
                  Mixed income coordinates W-2 wages with self-employment tax wage-base
                  rules.
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="net-se-income">
                  Net self-employment income ({TAX_YEAR})
                </Label>
                <Input
                  id="net-se-income"
                  inputMode="decimal"
                  autoComplete="off"
                  value={netSelfEmploymentIncome}
                  onChange={(event) => setNetSelfEmploymentIncome(event.target.value)}
                  aria-invalid={netSeInvalid}
                  aria-describedby="net-se-income-help"
                />
                <p id="net-se-income-help" className="tc-caption">
                  Net profit after business expenses.
                </p>
              </div>

              {isMixed ? (
                <>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="w2-wages">W-2 wages ({TAX_YEAR})</Label>
                    <Input
                      id="w2-wages"
                      inputMode="decimal"
                      autoComplete="off"
                      value={w2Wages}
                      onChange={(event) => setW2Wages(event.target.value)}
                      aria-invalid={w2Invalid}
                      aria-describedby="w2-wages-help"
                    />
                    <p id="w2-wages-help" className="tc-caption">
                      W-2 wages subject to Social Security for wage-base coordination.
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <InfoCallout variant="info" title="Mixed income estimate scope">
                      W-2 employee FICA is not included in the estimated federal tax
                      liability. This calculator focuses on income tax, self-employment
                      tax, withholding, and estimated payments.
                    </InfoCallout>
                  </div>
                </>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="federal-withholding">
                  Federal withholding (optional)
                </Label>
                <Input
                  id="federal-withholding"
                  inputMode="decimal"
                  autoComplete="off"
                  value={federalWithholding}
                  onChange={(event) => setFederalWithholding(event.target.value)}
                  aria-invalid={withholdingInvalid}
                  aria-describedby="federal-withholding-help"
                />
                <p id="federal-withholding-help" className="tc-caption">
                  Expected annual federal tax withheld from W-2 paychecks.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="other-income">Other income (optional)</Label>
                <Input
                  id="other-income"
                  inputMode="decimal"
                  autoComplete="off"
                  value={otherIncome}
                  onChange={(event) => setOtherIncome(event.target.value)}
                  aria-invalid={otherIncomeInvalid}
                  aria-describedby="other-income-help"
                />
                <p id="other-income-help" className="tc-caption">
                  Other ordinary income for federal tax.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-payments">
                  Estimated payments made (optional)
                </Label>
                <Input
                  id="estimated-payments"
                  inputMode="decimal"
                  autoComplete="off"
                  value={estimatedPaymentsMade}
                  onChange={(event) =>
                    setEstimatedPaymentsMade(event.target.value)
                  }
                  aria-invalid={paymentsInvalid}
                  aria-describedby="estimated-payments-help"
                />
                <p id="estimated-payments-help" className="tc-caption">
                  Federal estimated tax already paid this year.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prior-year-tax">Prior-year tax (optional)</Label>
                <Input
                  id="prior-year-tax"
                  inputMode="decimal"
                  autoComplete="off"
                  value={priorYearTax}
                  onChange={(event) => setPriorYearTax(event.target.value)}
                  aria-invalid={priorYearTaxInvalid}
                  aria-describedby="prior-year-tax-help"
                />
                <p id="prior-year-tax-help" className="tc-caption">
                  Total federal tax from your prior-year return.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prior-year-agi">Prior-year AGI (optional)</Label>
                <Input
                  id="prior-year-agi"
                  inputMode="decimal"
                  autoComplete="off"
                  value={priorYearAgi}
                  onChange={(event) => setPriorYearAgi(event.target.value)}
                  aria-invalid={priorYearAgiInvalid}
                  aria-describedby="prior-year-agi-help"
                />
                <p id="prior-year-agi-help" className="tc-caption">
                  Adjusted gross income from your prior-year return.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <PrimaryResults items={primary} taxYear={TAX_YEAR} />
      </div>

      <BreakdownResults
        items={breakdown}
        description="Withholding, payments, safe harbor metrics, due dates, and annual tax components."
      />

      <WarningPanel warnings={result.warnings} />

      <DisclaimerPanel disclaimer={result.disclaimer} />

      <NextStepsPanel journeyId="estimated-tax" />

      <InfoCallout variant="neutral" title="Privacy">
        Calculations run locally in your browser. Nothing is sent to a server or
        stored.
      </InfoCallout>
    </div>
  );
}
