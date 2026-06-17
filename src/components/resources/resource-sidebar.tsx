import Link from 'next/link';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  TagIcon,
} from 'lucide-react';

import { CalculatorTopicIcon } from '@/components/calculator/calculator-topic-icon';
import { getResourceCategoryLabel } from '@/config/resource-hub';
import type { ResourceDefinition } from '@/config/resources';
import {
  METHODOLOGY_LINK_HREF,
  METHODOLOGY_LINK_LABEL,
} from '@/config/related-content';
import type { NavLink } from '@/config/site-navigation';
import {
  formatLastReviewedLabel,
  formatTaxYearLabel,
} from '@/lib/calculators/metadata-labels';
import type { RelatedContentLink } from '@/lib/conversion/types';
import type { GuideLink } from '@/lib/calculators/related-links';
import { cn } from '@/lib/utils';

function SidebarSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SidebarLinkList({
  items,
  icon: Icon,
  useCalculatorTopicIcons = false,
}: {
  items: Array<{ href: string; label: string; description?: string }>;
  icon?: React.ComponentType<{ className?: string }>;
  useCalculatorTopicIcons?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="group flex items-start gap-2 rounded-md px-2 py-1.5 no-underline transition-colors hover:bg-muted tc-focus-ring"
          >
            {useCalculatorTopicIcons ? (
              <CalculatorTopicIcon href={item.href} size="sm" className="mt-0.5" />
            ) : Icon ? (
              <Icon
                className="mt-0.5 size-3.5 shrink-0 text-muted-foreground group-hover:text-tc-brand"
                aria-hidden
              />
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-foreground group-hover:text-tc-link">
                {item.label}
              </span>
              {item.description ? (
                <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-muted-foreground">
                  {item.description}
                </span>
              ) : null}
            </span>
            <ArrowRightIcon
              className="mt-0.5 size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ResourceArticleDetails({ resource }: { resource: ResourceDefinition }) {
  const categoryLabel = getResourceCategoryLabel(resource.category);

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-tc-sm">
      <SidebarSection title="Article details">
        <dl className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <TagIcon className="mt-0.5 size-3.5 shrink-0 text-tc-brand" aria-hidden />
            <div>
              <dt className="sr-only">Category</dt>
              <dd className="font-medium text-foreground">{categoryLabel}</dd>
            </div>
          </div>
          {resource.taxYear !== undefined ? (
            <div className="flex items-start gap-2">
              <CalendarIcon className="mt-0.5 size-3.5 shrink-0 text-tc-brand" aria-hidden />
              <div>
                <dt className="sr-only">Tax year</dt>
                <dd>{formatTaxYearLabel(resource.taxYear)}</dd>
              </div>
            </div>
          ) : null}
          <div className="flex items-start gap-2">
            <CalendarIcon className="mt-0.5 size-3.5 shrink-0 text-tc-brand" aria-hidden />
            <div>
              <dt className="sr-only">Last reviewed</dt>
              <dd>{formatLastReviewedLabel(resource.lastReviewed)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ClockIcon className="mt-0.5 size-3.5 shrink-0 text-tc-brand" aria-hidden />
            <div>
              <dt className="sr-only">Reading time</dt>
              <dd>{resource.readingTime}</dd>
            </div>
          </div>
        </dl>
      </SidebarSection>
    </div>
  );
}

export function ResourceSidebar({
  resource,
  relatedCalculators,
  relatedResources,
  relatedArticles = [],
  className,
}: {
  resource: ResourceDefinition;
  relatedCalculators: NavLink[] | RelatedContentLink[];
  relatedResources: GuideLink[] | RelatedContentLink[];
  relatedArticles?: RelatedContentLink[];
  className?: string;
}) {
  const calculatorItems = relatedCalculators.map((item) =>
    'label' in item
      ? { href: item.href, label: item.label, description: item.description }
      : { href: item.href, label: item.title, description: item.description },
  );
  const resourceItems = relatedResources.map((item) =>
    'title' in item && !('label' in item)
      ? { href: item.href, label: item.title, description: item.description }
      : { href: (item as NavLink).href, label: (item as NavLink).label, description: (item as NavLink).description },
  );
  const articleItems = relatedArticles.map((item) => ({
    href: item.href,
    label: item.title,
    description: item.description,
  }));

  return (
    <aside className={cn('space-y-3', className)}>
      <ResourceArticleDetails resource={resource} />

      {calculatorItems.length > 0 ? (
        <div className="rounded-lg border border-border bg-card p-3 shadow-tc-sm">
          <SidebarSection title="Related calculators">
            <SidebarLinkList
              useCalculatorTopicIcons
              items={calculatorItems}
            />
          </SidebarSection>
        </div>
      ) : null}

      {resourceItems.length > 0 ? (
        <div className="rounded-lg border border-border bg-card p-3 shadow-tc-sm">
          <SidebarSection title="Related resources">
            <SidebarLinkList
              icon={BookOpenIcon}
              items={resourceItems}
            />
          </SidebarSection>
        </div>
      ) : null}

      {articleItems.length > 0 ? (
        <div className="rounded-lg border border-border bg-card p-3 shadow-tc-sm">
          <SidebarSection title="Related articles">
            <SidebarLinkList
              icon={FileTextIcon}
              items={articleItems}
            />
          </SidebarSection>
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-3 shadow-tc-sm">
        <Link
          href={METHODOLOGY_LINK_HREF}
          className="group flex items-center gap-2 text-xs font-medium text-foreground no-underline transition-colors hover:text-tc-link"
        >
          <BookOpenIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
          <span className="flex-1">{METHODOLOGY_LINK_LABEL}</span>
          <ArrowRightIcon
            className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </Link>
      </div>
    </aside>
  );
}
