'use client';

import { useMemo, useState } from 'react';

import { BreakdownResults } from '@/components/calculator/breakdown-results';
import { DisclaimerPanel } from '@/components/calculator/disclaimer-panel';
import { NextStepsPanel } from '@/components/calculator/next-steps-panel';
import { PrimaryResults } from '@/components/calculator/primary-results';
import { WarningPanel } from '@/components/calculator/warning-panel';
import { InfoCallout } from '@/components/calculator/info-callout';
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
import { FILING_STATUS_LABELS } from '@/lib/filing-status-labels';
import {
  applyPrimaryLabelOverrides,
  partitionResultCards,
  PAYMENT_PLANNING_PRIMARY_LABEL_OVERRIDES,
  SELF_EMPLOYED_PRIMARY_RESULT_IDS,
} from '@/lib/calculators/result-layout';
import {
  calculateSelfEmployedTax,
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

function isNegativeInput(value: string): boolean {
  const normalized = value.replace(/,/g, '').trim();
  if (normalized === '' || normalized === '-') return false;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed < 0;
}

export function SelfEmployedTaxCalculator() {
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [netSelfEmploymentIncome, setNetSelfEmploymentIncome] = useState('75000');
  const [otherIncome, setOtherIncome] = useState('0');
  const [estimatedPaymentsMade, setEstimatedPaymentsMade] = useState('0');

  const netSeInvalid = isNegativeInput(netSelfEmploymentIncome);
  const otherIncomeInvalid = isNegativeInput(otherIncome);
  const paymentsInvalid = isNegativeInput(estimatedPaymentsMade);

  const result = useMemo(() => {
    return calculateSelfEmployedTax({
      taxYear: TAX_YEAR,
      filingStatus,
      netSelfEmploymentIncomeCents: dollarsToCents(
        parseDollarInput(netSelfEmploymentIncome),
      ),
      otherIncomeCents: dollarsToCents(parseDollarInput(otherIncome)),
      estimatedPaymentsMadeCents: dollarsToCents(
        parseDollarInput(estimatedPaymentsMade),
      ),
    });
  }, [
    filingStatus,
    netSelfEmploymentIncome,
    otherIncome,
    estimatedPaymentsMade,
  ]);

  const { primary: primaryCards, breakdown } = partitionResultCards(
    result.summary,
    SELF_EMPLOYED_PRIMARY_RESULT_IDS,
  );
  const primary = applyPrimaryLabelOverrides(
    primaryCards,
    PAYMENT_PLANNING_PRIMARY_LABEL_OVERRIDES,
  );

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
              aria-label="Self-employed tax calculator inputs"
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
                  Federal estimated tax already paid.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <PrimaryResults items={primary} taxYear={TAX_YEAR} />
      </div>

      <BreakdownResults items={breakdown} />

      <WarningPanel warnings={result.warnings} />

      <DisclaimerPanel disclaimer={result.disclaimer} />

      <NextStepsPanel journeyId="self-employed-tax" />

      <InfoCallout variant="neutral" title="Privacy">
        Calculations run locally in your browser. Nothing is sent to a server or
        stored.
      </InfoCallout>
    </div>
  );
}
