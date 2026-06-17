import { ScaleIcon } from 'lucide-react';

import type { TaxDisclaimer } from '@/lib/tax-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function DisclaimerPanel({
  disclaimer,
  title = 'Disclaimer',
  className,
}: {
  disclaimer: TaxDisclaimer;
  title?: string;
  className?: string;
}) {
  return (
    <Card
      className={cn('border-border bg-muted/30 shadow-none', className)}
      id={disclaimer.key}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ScaleIcon className="size-4 text-muted-foreground" aria-hidden />
          <CardTitle className="text-sm font-semibold text-foreground">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {disclaimer.text}
        </p>
      </CardContent>
    </Card>
  );
}
