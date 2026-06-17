import type { HsaWorkedExampleRow } from '@/lib/calculators/hsa-tax-page';
import { formatHsaExampleCurrency } from '@/lib/calculators/hsa-tax-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function ExampleMetric({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3 first:border-t-0 first:pt-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'tc-tabular text-sm font-semibold',
          emphasis ? 'text-tc-liability' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function HsaWorkedExampleCards({
  examples,
  className,
}: {
  examples: HsaWorkedExampleRow[];
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      {examples.map((example) => (
        <Card key={example.key} className="shadow-tc-sm">
          <CardHeader className="pb-3">
            <p className="tc-overline">Example</p>
            <CardTitle className="text-lg font-semibold tracking-tight">
              {example.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{example.subtitle}</p>
          </CardHeader>
          <CardContent className="space-y-0">
            <ExampleMetric
              label="Total estimated tax savings"
              value={formatHsaExampleCurrency(example.totalTaxSavingsCents)}
              emphasis
            />
            <ExampleMetric
              label="Federal income tax savings"
              value={formatHsaExampleCurrency(example.federalIncomeTaxSavingsCents)}
            />
            <ExampleMetric
              label="Payroll tax savings"
              value={formatHsaExampleCurrency(example.payrollTaxSavingsCents)}
            />
            <ExampleMetric
              label="Net after-tax cost"
              value={formatHsaExampleCurrency(example.netAfterTaxCostCents)}
            />
            <ExampleMetric
              label="Contribution limit"
              value={formatHsaExampleCurrency(example.contributionLimitCents)}
            />
            {example.excessContributionCents > 0 ? (
              <ExampleMetric
                label="Excess contribution"
                value={formatHsaExampleCurrency(example.excessContributionCents)}
                emphasis
              />
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
