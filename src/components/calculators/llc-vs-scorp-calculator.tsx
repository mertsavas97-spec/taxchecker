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
  buildLlcVsScorpBreakdownCards,
  buildLlcVsScorpPrimaryCards,
  LLC_VS_SCORP_PRIMARY_LABEL_OVERRIDES,
} from '@/lib/calculators/result-layout';
import { FILING_STATUS_LABELS } from '@/lib/filing-status-labels';
import {
  calculateLlcVsSCorp,
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

export function LlcVsScorpCalculator() {
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [llcBusinessProfit, setLlcBusinessProfit] = useState('150000');
  const [sCorpBusinessProfit, setSCorpBusinessProfit] = useState('150000');
  const [sCorpOwnerSalary, setSCorpOwnerSalary] = useState('75000');
  const [annualPayrollAdminCost, setAnnualPayrollAdminCost] = useState('1500');
  const [annualStateComplianceCost, setAnnualStateComplianceCost] = useState('800');
  const [annualTaxPrepCost, setAnnualTaxPrepCost] = useState('1200');
  const [otherIncome, setOtherIncome] = useState('0');

  const llcProfitInvalid = isNegativeInput(llcBusinessProfit);
  const sCorpProfitInvalid = isNegativeInput(sCorpBusinessProfit);
  const salaryInvalid = isNegativeInput(sCorpOwnerSalary);
  const payrollInvalid = isNegativeInput(annualPayrollAdminCost);
  const stateComplianceInvalid = isNegativeInput(annualStateComplianceCost);
  const taxPrepInvalid = isNegativeInput(annualTaxPrepCost);
  const otherIncomeInvalid = isNegativeInput(otherIncome);

  const result = useMemo(() => {
    const llcProfitCents = dollarsToCents(parseDollarInput(llcBusinessProfit));
    const sCorpProfitCents = dollarsToCents(parseDollarInput(sCorpBusinessProfit));

    return calculateLlcVsSCorp({
      taxYear: TAX_YEAR,
      filingStatus,
      llcBusinessProfitCents: llcProfitCents,
      sCorpBusinessProfitCents: sCorpProfitCents,
      sCorpOwnerSalaryCents: dollarsToCents(parseDollarInput(sCorpOwnerSalary)),
      annualPayrollAdminCostCents: dollarsToCents(
        parseDollarInput(annualPayrollAdminCost),
      ),
      annualStateComplianceCostCents: dollarsToCents(
        parseDollarInput(annualStateComplianceCost),
      ),
      annualTaxPrepCostCents: dollarsToCents(parseDollarInput(annualTaxPrepCost)),
      otherIncomeCents: dollarsToCents(parseDollarInput(otherIncome)),
    });
  }, [
    filingStatus,
    llcBusinessProfit,
    sCorpBusinessProfit,
    sCorpOwnerSalary,
    annualPayrollAdminCost,
    annualStateComplianceCost,
    annualTaxPrepCost,
    otherIncome,
  ]);

  const primary = applyPrimaryLabelOverrides(
    buildLlcVsScorpPrimaryCards(result.summary, result.details),
    LLC_VS_SCORP_PRIMARY_LABEL_OVERRIDES,
  );
  const breakdown = buildLlcVsScorpBreakdownCards(result.summary, result.details);

  return (
    <div className="space-y-5">
      <InfoCallout variant="neutral" title="Not legal or entity advice">
        S corporation owner salary is user-entered. This calculator does not evaluate
        reasonable compensation, recommend S corporation election, or recommend LLC or S
        corporation structure. Review entity and compensation decisions with a CPA and
        attorney.
      </InfoCallout>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <Card className="shadow-tc-sm">
          <CardHeader className="pb-3">
            <p className="tc-overline">Inputs</p>
            <CardTitle className="text-base font-semibold">Comparison assumptions</CardTitle>
            <p className="text-sm text-muted-foreground">All amounts in U.S. dollars.</p>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => event.preventDefault()}
              aria-label="LLC vs S Corp calculator inputs"
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
                <Label htmlFor="llc-business-profit">LLC business profit ({TAX_YEAR})</Label>
                <Input
                  id="llc-business-profit"
                  inputMode="decimal"
                  autoComplete="off"
                  value={llcBusinessProfit}
                  onChange={(event) => setLlcBusinessProfit(event.target.value)}
                  aria-invalid={llcProfitInvalid}
                  aria-describedby="llc-business-profit-help"
                />
                <p id="llc-business-profit-help" className="tc-caption">
                  Net profit for default LLC pass-through treatment.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scorp-business-profit">
                  S Corp business profit (optional)
                </Label>
                <Input
                  id="scorp-business-profit"
                  inputMode="decimal"
                  autoComplete="off"
                  value={sCorpBusinessProfit}
                  onChange={(event) => setSCorpBusinessProfit(event.target.value)}
                  aria-invalid={sCorpProfitInvalid}
                  aria-describedby="scorp-business-profit-help"
                />
                <p id="scorp-business-profit-help" className="tc-caption">
                  Defaults to LLC profit when equal. Use to model different S Corp profit.
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="scorp-owner-salary">S Corp owner salary ({TAX_YEAR})</Label>
                <Input
                  id="scorp-owner-salary"
                  inputMode="decimal"
                  autoComplete="off"
                  value={sCorpOwnerSalary}
                  onChange={(event) => setSCorpOwnerSalary(event.target.value)}
                  aria-invalid={salaryInvalid}
                  aria-describedby="scorp-owner-salary-help"
                />
                <p id="scorp-owner-salary-help" className="tc-caption">
                  W-2 salary you want to model—not a recommended reasonable amount.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payroll-admin-cost">
                  Annual payroll/admin cost (optional)
                </Label>
                <Input
                  id="payroll-admin-cost"
                  inputMode="decimal"
                  autoComplete="off"
                  value={annualPayrollAdminCost}
                  onChange={(event) => setAnnualPayrollAdminCost(event.target.value)}
                  aria-invalid={payrollInvalid}
                  aria-describedby="payroll-admin-cost-help"
                />
                <p id="payroll-admin-cost-help" className="tc-caption">
                  S Corp payroll service, bookkeeping, or admin costs.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state-compliance-cost">
                  Annual state compliance cost (optional)
                </Label>
                <Input
                  id="state-compliance-cost"
                  inputMode="decimal"
                  autoComplete="off"
                  value={annualStateComplianceCost}
                  onChange={(event) =>
                    setAnnualStateComplianceCost(event.target.value)
                  }
                  aria-invalid={stateComplianceInvalid}
                  aria-describedby="state-compliance-cost-help"
                />
                <p id="state-compliance-cost-help" className="tc-caption">
                  State annual reports, franchise fees, or similar.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-prep-cost">Annual tax prep cost (optional)</Label>
                <Input
                  id="tax-prep-cost"
                  inputMode="decimal"
                  autoComplete="off"
                  value={annualTaxPrepCost}
                  onChange={(event) => setAnnualTaxPrepCost(event.target.value)}
                  aria-invalid={taxPrepInvalid}
                  aria-describedby="tax-prep-cost-help"
                />
                <p id="tax-prep-cost-help" className="tc-caption">
                  Additional S Corp tax preparation costs.
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
                  Other ordinary income outside the business.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <PrimaryResults
          items={primary}
          taxYear={TAX_YEAR}
          title="Comparison summary"
          description="Higher estimated after-tax value is based only on your inputs—not a recommendation to choose LLC or S corporation status."
        />
      </div>

      <BreakdownResults
        items={breakdown}
        description="Federal tax burdens, S Corp distribution, salary assumption, compliance costs, and FICA."
      />

      <WarningPanel warnings={result.warnings} />

      <DisclaimerPanel disclaimer={result.disclaimer} />

      <NextStepsPanel journeyId="llc-vs-scorp" />

      <InfoCallout variant="neutral" title="Privacy">
        Calculations run locally in your browser. Nothing is sent to a server or
        stored.
      </InfoCallout>
    </div>
  );
}
