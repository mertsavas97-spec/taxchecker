import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getHomeHeroPreview } from '@/lib/home/hero-preview';
import { cn } from '@/lib/utils';

function PreviewMetric({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-md border px-2.5 py-2',
        emphasis
          ? 'border-tc-liability/25 bg-tc-liability-muted/50'
          : 'border-border bg-background/80',
      )}
    >
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          'tc-tabular mt-0.5 text-base font-semibold',
          emphasis ? 'text-tc-liability' : 'text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function HeroPreviewCard({ className }: { className?: string }) {
  const preview = getHomeHeroPreview();

  return (
    <Card
      size="sm"
      className={cn(
        'overflow-hidden border-tc-brand/20 bg-card shadow-tc-md ring-1 ring-tc-brand/10',
        className,
      )}
    >
      <div className="border-b border-border bg-tc-slate-100/80 px-3 py-2">
        <p className="tc-overline text-[10px]">Live Calculator Preview</p>
        <p className="text-xs text-muted-foreground">
          Self-employed · single · {preview.taxYear}
        </p>
      </div>
      <CardHeader className="border-b border-border/70 pb-2.5">
        <p className="text-xs text-muted-foreground">Example net self-employment income</p>
        <p className="tc-tabular text-2xl font-semibold tracking-tight text-foreground">
          {preview.incomeLabel}
        </p>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <PreviewMetric
          label="Estimated federal tax"
          value={preview.totalFederalTax}
          emphasis
        />
        <div className="grid grid-cols-2 gap-2">
          <PreviewMetric
            label="Estimated quarterly payment"
            value={preview.quarterlyPayment}
          />
          <PreviewMetric label="Monthly reserve" value={preview.monthlyReserve} />
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Same tax engine as the self-employed calculator. Your results will vary.
        </p>
        <Button variant="outline" size="sm" className="h-7 w-full text-xs" asChild>
          <Link href="/calculators/self-employed-tax">
            Try this calculator
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
