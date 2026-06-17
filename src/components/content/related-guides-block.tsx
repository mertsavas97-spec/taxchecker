import Link from 'next/link';
import { ArrowRightIcon, BookOpenIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RELATED_RESOURCES_DESCRIPTION,
  RELATED_RESOURCES_TITLE,
} from '@/config/related-content';
import type { GuideLink } from '@/lib/calculators/related-links';
import { cn } from '@/lib/utils';

export type { GuideLink };

export function RelatedGuidesBlock({
  title = RELATED_RESOURCES_TITLE,
  description = RELATED_RESOURCES_DESCRIPTION,
  guides,
  className,
}: {
  title?: string;
  description?: string;
  guides: GuideLink[];
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
          {guides.map((guide) => {
            const content = (
              <>
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <BookOpenIcon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        guide.comingSoon
                          ? 'text-muted-foreground'
                          : 'text-foreground group-hover:text-tc-link',
                      )}
                    >
                      {guide.title}
                    </span>
                    {guide.comingSoon ? (
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        Coming soon
                      </Badge>
                    ) : (
                      <ArrowRightIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </span>
                  {guide.description ? (
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {guide.description}
                    </span>
                  ) : null}
                  {guide.readingTime ? (
                    <span className="mt-1 block text-xs text-muted-foreground/80">
                      {guide.readingTime}
                    </span>
                  ) : null}
                </span>
              </>
            );

            return (
              <li key={guide.href}>
                {guide.comingSoon ? (
                  <div
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                    aria-label={`${guide.title} — coming soon`}
                  >
                    {content}
                  </div>
                ) : (
                  <Link
                    href={guide.href}
                    className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
