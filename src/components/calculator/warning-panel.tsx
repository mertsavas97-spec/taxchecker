import { AlertTriangleIcon } from 'lucide-react';

import type { TaxWarning } from '@/lib/tax-engine';
import { getWarningTitle } from '@/lib/warning-labels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function WarningPanel({
  warnings,
  title = 'Important notices',
  className,
}: {
  warnings: TaxWarning[];
  title?: string;
  className?: string;
}) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <Card
      className={cn(
        'border-tc-warning/30 bg-tc-warning-muted/30 shadow-tc-xs',
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="size-4 text-tc-warning" aria-hidden />
          <CardTitle className="text-sm font-semibold text-foreground">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y divide-tc-warning/15">
          {warnings.map((warning) => (
            <li key={warning.code} className="py-2.5 first:pt-0 last:pb-0">
              <p className="text-sm font-medium text-foreground">
                {getWarningTitle(warning.code)}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {warning.message}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
