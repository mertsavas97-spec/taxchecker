import { ShieldCheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function CalculatorTrustIndicators({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'flex flex-wrap gap-2',
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground shadow-tc-xs"
        >
          <ShieldCheckIcon
            className="size-3 shrink-0 text-tc-savings"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
