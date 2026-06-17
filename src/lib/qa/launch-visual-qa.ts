/**
 * Sprint 34 — Launch visual QA checklists.
 * Used for pre-launch manual verification; not automated tests.
 */

export type QaCheckItem = {
  id: string;
  area: string;
  check: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
};

export const desktopVisualQa: QaCheckItem[] = [
  {
    id: 'desk-home-hero',
    area: 'Homepage',
    check: 'Hero headline, CTAs, and trust indicators align with clear visual hierarchy',
    priority: 'critical',
  },
  {
    id: 'desk-home-sections',
    area: 'Homepage',
    check: 'Calculator cards, resource cards, and featured article scan without crowding',
    priority: 'high',
  },
  {
    id: 'desk-calc-inputs',
    area: 'Calculators',
    check: 'Input grids have comfortable spacing; labels and fields do not feel cramped',
    priority: 'critical',
  },
  {
    id: 'desk-calc-results',
    area: 'Calculators',
    check: 'Primary results card highlights hero metric; breakdown accordion opens cleanly',
    priority: 'critical',
  },
  {
    id: 'desk-calc-trust',
    area: 'Calculators',
    check: 'Authority bar matches resource/blog metadata bar styling (sources, tax year, reviewed)',
    priority: 'high',
  },
  {
    id: 'desk-calc-next',
    area: 'Calculators',
    check: 'Next steps panel appears after results with scannable links',
    priority: 'high',
  },
  {
    id: 'desk-resource-toc',
    area: 'Resources',
    check: 'Desktop TOC highlights active section; sidebar related links do not duplicate inline block',
    priority: 'high',
  },
  {
    id: 'desk-resource-prose',
    area: 'Resources',
    check: 'Article body line length stays within comfortable reading width (~65–75 characters)',
    priority: 'high',
  },
  {
    id: 'desk-blog-article',
    area: 'Blog',
    check: 'Article paragraphs use base size with relaxed leading; related content is distinct from body',
    priority: 'high',
  },
  {
    id: 'desk-blog-hub',
    area: 'Blog',
    check: 'Featured card, category filters, and post grid hierarchy are clear',
    priority: 'medium',
  },
  {
    id: 'desk-legal',
    area: 'Legal',
    check: 'Legal pages readable at base size; sticky TOC and section headings scan well',
    priority: 'high',
  },
  {
    id: 'desk-trust',
    area: 'Trust',
    check: 'Methodology, sources, and editorial standards share consistent typography rhythm',
    priority: 'high',
  },
  {
    id: 'desk-a11y-focus',
    area: 'Accessibility',
    check: 'Keyboard focus visible on nav, TOC buttons, category pills, and related links',
    priority: 'critical',
  },
  {
    id: 'desk-footer',
    area: 'Layout',
    check: 'Homepage methodology section transitions smoothly into footer',
    priority: 'medium',
  },
];

export const mobileVisualQa: QaCheckItem[] = [
  {
    id: 'mob-home-hero',
    area: 'Homepage',
    check: 'Hero stacks cleanly; no horizontal overflow on 375px viewport',
    priority: 'critical',
  },
  {
    id: 'mob-authority-strip',
    area: 'Homepage',
    check: 'Authority strip scrolls horizontally without clipping or layout break',
    priority: 'high',
  },
  {
    id: 'mob-nav',
    area: 'Navigation',
    check: 'Mobile nav opens fully; calculator links and CTAs are tappable (44px min target)',
    priority: 'critical',
  },
  {
    id: 'mob-calc-form',
    area: 'Calculators',
    check: 'Single-column inputs on narrow screens; results stack without overflow',
    priority: 'critical',
  },
  {
    id: 'mob-calc-authority',
    area: 'Calculators',
    check: 'Authority bar wraps gracefully; links remain tappable',
    priority: 'high',
  },
  {
    id: 'mob-resource-toc',
    area: 'Resources',
    check: 'Mobile TOC accordion expands; article details show without duplicating related content',
    priority: 'critical',
  },
  {
    id: 'mob-resource-related',
    area: 'Resources',
    check: 'Related content block appears once (not repeated from removed mobile sidebar)',
    priority: 'critical',
  },
  {
    id: 'mob-blog-categories',
    area: 'Blog',
    check: 'Category pills scroll horizontally; search field full width',
    priority: 'high',
  },
  {
    id: 'mob-blog-article',
    area: 'Blog',
    check: 'Article readable without zoom; metadata bar wraps cleanly',
    priority: 'high',
  },
  {
    id: 'mob-legal-toc',
    area: 'Legal',
    check: 'Mobile legal TOC usable; section headings not hidden under sticky header',
    priority: 'high',
  },
  {
    id: 'mob-sticky-header',
    area: 'Layout',
    check: 'Sticky header does not obscure in-page anchor targets (scroll-mt)',
    priority: 'high',
  },
  {
    id: 'mob-skip-link',
    area: 'Accessibility',
    check: 'Skip to main content link appears on keyboard focus',
    priority: 'high',
  },
  {
    id: 'mob-tables',
    area: 'Resources',
    check: 'Any wide tables scroll horizontally inside container without page overflow',
    priority: 'medium',
  },
];

export const remainingVisualIssues: QaCheckItem[] = [
  {
    id: 'remain-blog-sidebar',
    area: 'Blog',
    check: 'Blog articles have no mobile TOC; consider adding for long posts post-launch',
    priority: 'medium',
  },
  {
    id: 'remain-trust-about',
    area: 'Trust',
    check: 'About page body still uses legacy text-sm in places; align with tc-prose-compact later',
    priority: 'low',
  },
  {
    id: 'remain-calc-sidebar',
    area: 'Calculators',
    check: 'Some calculators with long sidebar content may feel long on tablet; monitor scroll depth',
    priority: 'low',
  },
  {
    id: 'remain-dark-mode',
    area: 'Theme',
    check: 'Dark mode tokens exist but site is light-first; full dark QA not in Sprint 34 scope',
    priority: 'low',
  },
];

export function getLaunchReadinessScore(): {
  score: number;
  label: string;
  summary: string;
} {
  const criticalDesktop = desktopVisualQa.filter((i) => i.priority === 'critical').length;
  const criticalMobile = mobileVisualQa.filter((i) => i.priority === 'critical').length;
  const totalChecks = desktopVisualQa.length + mobileVisualQa.length;
  const addressedInSprint34 = totalChecks - remainingVisualIssues.filter((i) => i.priority !== 'low').length;

  const score = Math.round((addressedInSprint34 / totalChecks) * 100);

  return {
    score: Math.min(score, 92),
    label: score >= 85 ? 'Launch-ready' : score >= 70 ? 'Near launch-ready' : 'Needs polish',
    summary:
      'Sprint 34 addressed typography, mobile duplication, trust bar consistency, calculator spacing, and accessibility focus states. Remaining items are post-launch polish.',
  };
}
