'use client';

import type { ResultCard } from '@/lib/tax-engine';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatResultCardValue } from '@/lib/calculators/result-layout';
import { cn } from '@/lib/utils';

export function BreakdownResults({
  items,
  title = 'Detailed breakdown',
  description = 'Secondary metrics from your federal tax estimate.',
  className,
  defaultOpen = false,
}: {
  items: ResultCard[];
  title?: string;
  description?: string;
  className?: string;
  defaultOpen?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? 'breakdown' : undefined}
      className={cn('rounded-xl border border-border bg-card shadow-tc-xs', className)}
    >
      <AccordionItem value="breakdown" className="border-0 px-4">
        <AccordionTrigger className="py-4 hover:no-underline">
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-0.5 text-xs font-normal text-muted-foreground">
              {description}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <dl className="divide-y divide-border rounded-lg border border-border bg-muted/15">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <dt className="text-sm text-muted-foreground">{item.label}</dt>
                <dd className="tc-tabular text-sm font-semibold text-foreground">
                  {formatResultCardValue(item)}
                </dd>
              </div>
            ))}
          </dl>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
