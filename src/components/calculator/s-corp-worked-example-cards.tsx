import type { SCorpWorkedExampleRow } from '@/lib/calculators/s-corp-tax-page';
import { formatSCorpExampleCurrency } from '@/lib/calculators/s-corp-tax-page';
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

export function SCorpWorkedExampleCards({
  examples,
  className,
}: {
  examples: SCorpWorkedExampleRow[];
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
            <p className="text-sm text-muted-foreground">
              Single filer, no optional compliance costs or other income
            </p>
          </CardHeader>
          <CardContent className="space-y-0">
            <ExampleMetric
              label="Estimated S Corp net value"
              value={formatSCorpExampleCurrency(example.sCorpNetValueCents)}
            />
            <ExampleMetric
              label="Estimated savings vs sole proprietor"
              value={formatSCorpExampleCurrency(
                example.estimatedSavingsVsSoleProprietorCents,
              )}
              emphasis
            />
            <ExampleMetric
              label="Estimated federal tax burden"
              value={formatSCorpExampleCurrency(example.totalFederalTaxBurdenCents)}
            />
            <ExampleMetric
              label="Break-even profit estimate"
              value={
                example.breakEvenProfitCents !== null
                  ? formatSCorpExampleCurrency(example.breakEvenProfitCents)
                  : 'Not found'
              }
            />
            <ExampleMetric
              label="Estimated distribution"
              value={formatSCorpExampleCurrency(example.distributionCents)}
            />
            <ExampleMetric
              label="Sole proprietor tax burden"
              value={formatSCorpExampleCurrency(example.soleProprietorTaxBurdenCents)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
