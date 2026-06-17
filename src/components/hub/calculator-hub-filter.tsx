'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchIcon } from 'lucide-react';

import { CalculatorCard } from '@/components/hub/calculator-card';
import { Input } from '@/components/ui/input';
import {
  calculatorHubCategories,
  getAllHubCalculators,
  getCalculatorsForHubCategory,
  type HubCategoryId,
} from '@/config/calculator-hub';
import type { CalculatorDefinition } from '@/config/calculators';
import { cn } from '@/lib/utils';

function matchesQuery(calculator: CalculatorDefinition, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    calculator.title,
    calculator.shortTitle,
    calculator.description,
    calculator.primaryKeyword,
    ...calculator.secondaryKeywords,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
}

function isHubCategoryId(value: string | null): value is HubCategoryId {
  return calculatorHubCategories.some((category) => category.id === value);
}

export function CalculatorHubFilter() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<HubCategoryId | 'all'>(
    'all',
  );

  useEffect(() => {
    if (isHubCategoryId(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredCalculators = useMemo(() => {
    const base =
      activeCategory === 'all'
        ? getAllHubCalculators()
        : getCalculatorsForHubCategory(activeCategory);

    return base.filter((calculator) => matchesQuery(calculator, query));
  }, [activeCategory, query]);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card p-3 shadow-tc-sm">
        <div className="space-y-3">
          <div className="relative min-w-0">
            <label htmlFor="calculator-search" className="sr-only">
              Search calculators
            </label>
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="calculator-search"
              type="search"
              placeholder="Search by name or topic…"
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
            {calculatorHubCategories.map((category) => (
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

      {filteredCalculators.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCalculators.map((calculator) => (
            <CalculatorCard key={calculator.slug} calculator={calculator} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
          No calculators match your search. Try a different keyword or category.
        </p>
      )}
    </div>
  );
}
