import { describe, expect, it } from 'vitest';

import { getResourceEditorSeoChecks } from '@/lib/admin/resources/seo-checks';
import type { ResourceInput } from '@/lib/admin/content/types';
import { shouldUseRemotePublishedFallback } from '@/lib/admin/content/supabase-seed-policy';

const baseInput: ResourceInput = {
  slug: 'example-resource',
  title: 'Example Resource',
  shortTitle: 'Example',
  description: 'Short description for the example resource page.',
  content: 'A'.repeat(140),
  status: 'published',
  category: 'Guides',
  readingTime: '5 min read',
  taxYear: 2025,
  lastReviewed: '2026-06-16',
  sourceIds: ['schedule-se'],
  seoTitle: 'Example Resource SEO Title',
  seoDescription: 'Example SEO description with enough length for validation checks in tests.',
  featured: false,
  relatedCalculatorSlugs: ['self-employed-tax-calculator'],
  relatedResourceSlugs: ['quarterly-tax-guide'],
  relatedBlogSlugs: ['self-employment-tax-explained'],
};

describe('resource editor seo checks', () => {
  it('passes all checks for a complete resource input', () => {
    const checks = getResourceEditorSeoChecks(baseInput);
    expect(checks.every((check) => check.passed)).toBe(true);
  });

  it('fails when draft-like content is incomplete', () => {
    const checks = getResourceEditorSeoChecks({
      ...baseInput,
      seoDescription: 'too short',
      sourceIds: [],
    });
    expect(checks.some((check) => !check.passed)).toBe(true);
  });
});

describe('published resource fallback visibility', () => {
  it('treats empty remote lists as not sitemap-visible via fallback helper', () => {
    expect(shouldUseRemotePublishedFallback([])).toBe(false);
  });
});
