import Link from 'next/link';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalculatorIcon,
  FileTextIcon,
} from 'lucide-react';

import { CalculatorTopicIcon } from '@/components/calculator/calculator-topic-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { kindLabel } from '@/lib/conversion/build-links';
import type { RelatedContentLink } from '@/lib/conversion/types';
import { cn } from '@/lib/utils';

function LinkIcon({
  link,
  className,
}: {
  link: RelatedContentLink;
  className?: string;
}) {
  if (link.kind === 'calculator') {
    return (
      <CalculatorTopicIcon href={link.href} size="sm" className={className} />
    );
  }

  const Icon = link.kind === 'resource' ? BookOpenIcon : FileTextIcon;

  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground',
        className,
      )}
    >
      <Icon className="size-4" aria-hidden />
    </span>
  );
}

function RelatedContentLinkItem({
  link,
  compact = false,
  showKind = false,
}: {
  link: RelatedContentLink;
  compact?: boolean;
  showKind?: boolean;
}) {
  return (
    <Link
      href={link.href}
      className={cn(
        'group flex items-start gap-3 no-underline transition-colors tc-focus-ring rounded-md',
        compact ? 'rounded-md border border-border bg-card px-3 py-2.5 hover:border-tc-brand/25 hover:bg-muted/30' : 'py-3 first:pt-0 last:pb-0',
      )}
    >
      <LinkIcon link={link} className={compact ? 'mt-0' : 'mt-0.5'} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          {showKind ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {kindLabel(link.kind)}
            </span>
          ) : null}
          <span className="text-sm font-medium text-foreground group-hover:text-tc-link">
            {link.title}
          </span>
          <ArrowRightIcon
            className={cn(
              'size-3.5 shrink-0 text-tc-link transition-opacity',
              compact ? 'opacity-70' : 'opacity-0 group-hover:opacity-100',
            )}
            aria-hidden
          />
        </span>
        {link.description ? (
          <span
            className={cn(
              'mt-0.5 block leading-relaxed text-muted-foreground',
              compact ? 'line-clamp-2 text-xs' : 'text-xs',
            )}
          >
            {link.description}
          </span>
        ) : null}
        {link.readingTime ? (
          <span className="mt-1 block text-[11px] text-muted-foreground/80">
            {link.readingTime}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function RelatedContentSection({
  title,
  links,
  compact,
}: {
  title: string;
  links: RelatedContentLink[];
  compact?: boolean;
}) {
  if (links.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
        {title}
      </h3>
      <ul className={cn(compact ? 'space-y-2' : 'divide-y divide-border')}>
        {links.map((link) => (
          <li key={link.href}>
            <RelatedContentLinkItem link={link} compact={compact} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface RelatedContentBlockProps {
  calculators?: RelatedContentLink[];
  resources?: RelatedContentLink[];
  articles?: RelatedContentLink[];
  title?: string;
  description?: string;
  variant?: 'card' | 'inline' | 'compact';
  className?: string;
}

export function RelatedContentBlock({
  calculators = [],
  resources = [],
  articles = [],
  title = 'Related content',
  description,
  variant = 'card',
  className,
}: RelatedContentBlockProps) {
  const hasContent =
    calculators.length > 0 || resources.length > 0 || articles.length > 0;

  if (!hasContent) return null;

  if (variant === 'compact') {
    const flatLinks = [...calculators, ...resources, ...articles];

    return (
      <div className={cn('space-y-2', className)}>
        {title ? (
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        ) : null}
        <ul className="space-y-2">
          {flatLinks.map((link) => (
            <li key={link.href}>
              <RelatedContentLinkItem link={link} compact showKind />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const body = (
    <div className="space-y-5">
      <RelatedContentSection title="Calculators" links={calculators} />
      <RelatedContentSection title="Resources" links={resources} />
      <RelatedContentSection title="Articles" links={articles} />
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={cn('space-y-3 rounded-xl border border-border bg-card p-4 shadow-tc-sm', className)}>
        <div className="space-y-1">
          <h2 className="tc-heading-subsection text-foreground">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {body}
      </div>
    );
  }

  return (
    <Card className={cn('shadow-tc-sm', className)}>
      <CardHeader>
        <CardTitle className="tc-heading-subsection">{title}</CardTitle>
        {description ? <p className="tc-body text-sm">{description}</p> : null}
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}

export function RelatedContentFlatList({
  links,
  className,
}: {
  links: RelatedContentLink[];
  className?: string;
}) {
  if (links.length === 0) return null;

  return (
    <ul className={cn('space-y-2', className)}>
      {links.map((link) => (
        <li key={link.href}>
          <RelatedContentLinkItem link={link} compact showKind />
        </li>
      ))}
    </ul>
  );
}

/** @deprecated Use RelatedContentBlock with calculators prop */
export function RelatedCalculatorsFromLinks({
  calculators,
  className,
}: {
  calculators: RelatedContentLink[];
  className?: string;
}) {
  return (
    <RelatedContentBlock
      calculators={calculators}
      title="Related calculators"
      className={className}
    />
  );
}

export { CalculatorIcon };
