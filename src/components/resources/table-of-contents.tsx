'use client';

import { useEffect, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { TocEntry } from '@/lib/resources/toc';

const ARTICLE_MAIN_ID = 'resource-article-main';

function collectTocEntries(): TocEntry[] {
  const root = document.getElementById(ARTICLE_MAIN_ID);
  if (!root) return [];

  return Array.from(root.querySelectorAll<HTMLElement>('[data-toc-section]'))
    .map((section) => {
      const id = section.id;
      const label =
        section.dataset.tocLabel ??
        section.querySelector('h2')?.textContent?.trim() ??
        id;
      return id ? { id, label } : null;
    })
    .filter((entry): entry is TocEntry => entry !== null);
}

function useTocObserver(items: TocEntry[]) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (items.length === 0) return;

    const sections = items
      .map((entry) => document.getElementById(entry.id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((record) => record.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0]!.target.id);
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return activeId;
}

function TocList({
  items,
  activeId,
  onSelect,
}: {
  items: TocEntry[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ol className="space-y-1">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'tc-focus-ring w-full rounded-md px-2 py-2 text-left text-xs leading-snug transition-colors',
                isActive
                  ? 'bg-tc-brand/10 font-medium text-tc-link'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function MobileTableOfContents({ className }: { className?: string }) {
  const [items, setItems] = useState<TocEntry[]>([]);
  const [open, setOpen] = useState(false);
  const activeId = useTocObserver(items);

  useEffect(() => {
    setItems(collectTocEntries());
  }, []);

  if (items.length === 0) return null;

  return (
    <nav
      className={cn('lg:hidden', className)}
      aria-label="Table of contents"
    >
      <div className="rounded-lg border border-border bg-card shadow-tc-sm">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="tc-focus-ring flex w-full items-center justify-between rounded-lg px-3 py-3 text-left"
          aria-expanded={open}
        >
          <span className="text-xs font-semibold text-foreground">On this page</span>
          <ChevronDownIcon
            className={cn(
              'size-4 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
        {open ? (
          <div className="border-t border-border px-3 py-2">
            <TocList
              items={items}
              activeId={activeId}
              onSelect={(id) => {
                scrollToSection(id);
                setOpen(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export function TableOfContents({ className }: { className?: string }) {
  const [items, setItems] = useState<TocEntry[]>([]);
  const activeId = useTocObserver(items);

  useEffect(() => {
    setItems(collectTocEntries());
  }, []);

  if (items.length === 0) return null;

  return (
    <nav
      className={cn('hidden lg:block', className)}
      aria-label="Table of contents"
    >
      <div className="rounded-lg border border-border bg-card p-3 shadow-tc-sm">
        <p className="tc-overline mb-2">On this page</p>
        <TocList
          items={items}
          activeId={activeId}
          onSelect={scrollToSection}
        />
      </div>
    </nav>
  );
}
