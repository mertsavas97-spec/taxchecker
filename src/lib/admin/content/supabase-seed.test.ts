import { describe, expect, it } from 'vitest';

import {
  planSeedRowAction,
  shouldUseRemotePublishedFallback,
} from '@/lib/admin/content/supabase-seed-policy';
import {
  seedCmsBlogPosts,
  seedCmsCalculators,
  seedCmsResources,
} from '@/lib/admin/content/seed';

describe('planSeedRowAction', () => {
  it('inserts when the row does not exist', () => {
    expect(planSeedRowAction(false, {})).toBe('insert');
  });

  it('skips existing rows by default', () => {
    expect(planSeedRowAction(true, {})).toBe('skip');
  });

  it('updates existing rows when force is enabled', () => {
    expect(planSeedRowAction(true, { force: true })).toBe('update');
  });

  it('updates registry-backed rows even without force', () => {
    expect(
      planSeedRowAction(true, { alwaysSyncRegistry: true }),
    ).toBe('update');
  });

  it('skips edited blog rows unless force is enabled', () => {
    expect(planSeedRowAction(true, { edited: true })).toBe('skip');
    expect(planSeedRowAction(true, { edited: true, force: true })).toBe(
      'update',
    );
  });
});

describe('shouldUseRemotePublishedFallback', () => {
  it('uses remote data only when the array is non-empty', () => {
    expect(shouldUseRemotePublishedFallback([])).toBe(false);
    expect(shouldUseRemotePublishedFallback(null)).toBe(false);
    expect(shouldUseRemotePublishedFallback([{ slug: 'example' }])).toBe(
      true,
    );
  });
});

describe('seed slug uniqueness', () => {
  it('does not duplicate calculator slugs', () => {
    const slugs = seedCmsCalculators().map((row) => row.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.length).toBeGreaterThanOrEqual(8);
  });

  it('does not duplicate resource slugs', () => {
    const slugs = seedCmsResources().map((row) => row.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.length).toBeGreaterThan(0);
  });

  it('does not duplicate blog post slugs', () => {
    const slugs = seedCmsBlogPosts().map((row) => row.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.length).toBeGreaterThanOrEqual(10);
  });

  it('seeds published launch content with expected statuses', () => {
    const calculators = seedCmsCalculators();
    const resources = seedCmsResources();
    const blogPosts = seedCmsBlogPosts();

    expect(
      calculators.filter((row) => row.published).length,
    ).toBeGreaterThanOrEqual(8);
    expect(
      resources.filter((row) => row.status === 'published').length,
    ).toBeGreaterThan(0);
    expect(
      blogPosts.filter((row) => row.status === 'published').length,
    ).toBeGreaterThanOrEqual(10);
  });
});
