import type { LlcVsScorpWorkedExampleRow } from '@/lib/calculators/llc-vs-scorp-page';
import { formatLlcVsScorpExampleCurrency } from '@/lib/calculators/llc-vs-scorp-page';
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

export function LlcVsScorpWorkedExampleCards({
  examples,
  className,
}: {
  examples: LlcVsScorpWorkedExampleRow[];
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
              Single filer, same LLC and S Corp profit, no optional costs or other income
            </p>
          </CardHeader>
          <CardContent className="space-y-0">
            <ExampleMetric
              label="LLC estimated after-tax value"
              value={formatLlcVsScorpExampleCurrency(example.llcAfterTaxValueCents)}
            />
            <ExampleMetric
              label="S Corp estimated after-tax value"
              value={formatLlcVsScorpExampleCurrency(example.sCorpAfterTaxValueCents)}
            />
            <ExampleMetric
              label="Estimated difference (LLC minus S Corp)"
              value={formatLlcVsScorpExampleCurrency(example.afterTaxDifferenceCents)}
              emphasis
            />
            <ExampleMetric
              label="Break-even profit estimate"
              value={
                example.breakEvenProfitCents !== null
                  ? formatLlcVsScorpExampleCurrency(example.breakEvenProfitCents)
                  : 'Not found'
              }
            />
            <ExampleMetric
              label="LLC federal tax burden"
              value={formatLlcVsScorpExampleCurrency(example.llcFederalTaxBurdenCents)}
            />
            <ExampleMetric
              label="S Corp federal tax burden"
              value={formatLlcVsScorpExampleCurrency(example.sCorpFederalTaxBurdenCents)}
            />
            <ExampleMetric
              label="S Corp distribution"
              value={formatLlcVsScorpExampleCurrency(example.sCorpDistributionCents)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
