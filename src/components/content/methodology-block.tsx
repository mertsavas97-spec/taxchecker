import Link from 'next/link';
import { CheckCircle2Icon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  METHODOLOGY_LINK_HREF,
  METHODOLOGY_LINK_LABEL,
} from '@/config/related-content';
import { cn } from '@/lib/utils';

export interface MethodologyPoint {
  title: string;
  description: string;
}

export function MethodologyBlock({
  title = 'How this estimate works',
  description,
  points,
  footer,
  methodologyHref = METHODOLOGY_LINK_HREF,
  className,
}: {
  title?: string;
  description?: string;
  points: MethodologyPoint[];
  footer?: string;
  methodologyHref?: string;
  className?: string;
}) {
  return (
    <Card className={cn('shadow-tc-sm', className)}>
      <CardHeader>
        <CardTitle className="tc-heading-subsection">{title}</CardTitle>
        {description ? <p className="tc-body text-sm">{description}</p> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-4">
          {points.map((point) => (
            <li key={point.title} className="flex gap-3">
              <CheckCircle2Icon
                className="mt-0.5 size-4 shrink-0 text-tc-savings"
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium text-foreground">{point.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {footer ? (
          <p className="border-t border-border pt-4 text-sm text-muted-foreground">
            {footer}
          </p>
        ) : null}
        {methodologyHref ? (
          <p className="border-t border-border pt-4 text-sm">
            <Link
              href={methodologyHref}
              className="font-medium text-tc-link no-underline hover:underline"
            >
              {METHODOLOGY_LINK_LABEL}
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
