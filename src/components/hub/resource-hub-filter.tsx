'use client';

import { useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';

import { ResourceCard } from '@/components/hub/resource-card';
import { Input } from '@/components/ui/input';
import {
  getAllHubResources,
  resourceHubCategories,
  type ResourceCategoryId,
} from '@/config/resource-hub';
import type { ResourceDefinition } from '@/config/resources';
import { cn } from '@/lib/utils';

function matchesQuery(resource: ResourceDefinition, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    resource.title,
    resource.shortTitle,
    resource.description,
    resource.primaryKeyword,
    ...resource.secondaryKeywords,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
}

export function ResourceHubFilter({
  resources = getAllHubResources(),
}: {
  resources?: ResourceDefinition[];
}) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ResourceCategoryId | 'all'>(
    'all',
  );

  const filteredResources = useMemo(() => {
    const base =
      activeCategory === 'all'
        ? resources
        : resources.filter((resource) => resource.category === activeCategory);

    return base.filter((resource) => matchesQuery(resource, query));
  }, [activeCategory, query, resources]);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card p-3 shadow-tc-sm">
        <div className="space-y-3">
          <div className="relative min-w-0">
            <label htmlFor="resource-search" className="sr-only">
              Search resources
            </label>
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="resource-search"
              type="search"
              placeholder="Search by title or topic…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-8 border-border/80 bg-background pl-8 text-sm"
              autoComplete="off"
            />
          </div>

          <div
            className="flex flex-wrap gap-1.5 border-t border-border/70 pt-3"
            role="tablist"
            aria-label="Filter by category"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                activeCategory === 'all'
                  ? 'border-tc-brand/30 bg-tc-brand/10 text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted',
              )}
            >
              All
            </button>
            {resourceHubCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  activeCategory === category.id
                    ? 'border-tc-brand/30 bg-tc-brand/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredResources.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          No resources match your search. Try a different keyword or category.
        </p>
      )}
    </div>
  );
}
