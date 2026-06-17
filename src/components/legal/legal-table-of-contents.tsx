'use client';

import { useEffect, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import type { LegalPageSection } from '@/lib/legal/types';
import { cn } from '@/lib/utils';

function scrollToLegalSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function LegalTocList({
  sections,
  activeId,
  onSelect,
}: {
  sections: LegalPageSection[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ol className="space-y-1">
      {sections.map((section) => {
        const isActive = activeId === section.id;
        return (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => onSelect(section.id)}
              className={cn(
                'w-full rounded-md px-2 py-1.5 text-left text-xs leading-snug transition-colors',
                isActive
                  ? 'bg-tc-brand/10 font-medium text-tc-link'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {section.heading}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function useLegalTocObserver(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
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
      { rootMargin: '-20% 0px -55% 0px', threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}

export function LegalMobileToc({ sections }: { sections: LegalPageSection[] }) {
  const sectionIds = sections.map((section) => section.id);
  const [open, setOpen] = useState(false);
  const activeId = useLegalTocObserver(sectionIds);

  if (sections.length === 0) return null;

  return (
    <nav className="lg:hidden" aria-label="Table of contents">
      <div className="rounded-lg border border-border bg-card shadow-tc-sm">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-left"
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
            <LegalTocList
              sections={sections}
              activeId={activeId}
              onSelect={(id) => {
                scrollToLegalSection(id);
                setOpen(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export function LegalDesktopToc({ sections }: { sections: LegalPageSection[] }) {
  const sectionIds = sections.map((section) => section.id);
  const activeId = useLegalTocObserver(sectionIds);

  if (sections.length === 0) return null;

  return (
    <nav className="hidden lg:block" aria-label="Table of contents">
      <div className="rounded-lg border border-border bg-card p-3 shadow-tc-sm">
        <p className="tc-overline mb-2">On this page</p>
        <LegalTocList
          sections={sections}
          activeId={activeId}
          onSelect={scrollToLegalSection}
        />
      </div>
    </nav>
  );
}
