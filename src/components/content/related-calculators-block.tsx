import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { CalculatorTopicIcon } from '@/components/calculator/calculator-topic-icon';
import type { NavLink } from '@/config/site-navigation';
import {
  RELATED_CALCULATORS_DESCRIPTION,
  RELATED_CALCULATORS_TITLE,
} from '@/config/related-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function RelatedCalculatorsBlock({
  title = RELATED_CALCULATORS_TITLE,
  description = RELATED_CALCULATORS_DESCRIPTION,
  calculators,
  className,
}: {
  title?: string;
  description?: string;
  calculators: NavLink[];
  className?: string;
}) {
  return (
    <Card className={cn('shadow-tc-sm', className)}>
      <CardHeader>
        <CardTitle className="tc-heading-subsection">{title}</CardTitle>
        {description ? <p className="tc-body text-sm">{description}</p> : null}
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {calculators.map((calculator) => (
            <li key={calculator.href}>
              <Link
                href={calculator.href}
                className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <CalculatorTopicIcon href={calculator.href} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-tc-link">
                    {calculator.label}
                    <ArrowRightIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  {calculator.description ? (
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {calculator.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
