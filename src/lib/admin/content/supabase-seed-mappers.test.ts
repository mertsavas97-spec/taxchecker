import { describe, expect, it } from 'vitest';

import { seedCmsBlogPosts } from '@/lib/admin/content/seed';
import {
  mapCmsBlogPostToDbForSeed,
  mapCmsCalculatorToDbForSeed,
  mapCmsResourceToDbForSeed,
} from '@/lib/admin/content/supabase-seed-mappers';
import { seedCmsCalculators, seedCmsResources } from '@/lib/admin/content/seed';

describe('supabase seed mappers', () => {
  it('maps blog published_at to timestamptz for Supabase', () => {
    const post = seedCmsBlogPosts()[0]!;
    const payload = mapCmsBlogPostToDbForSeed(post);

    expect(payload.published_at).toMatch(/T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(payload).not.toHaveProperty('related_blog_posts');
  });

  it('maps resource published_at to timestamptz for Supabase', () => {
    const resource = seedCmsResources().find((row) => row.status === 'published')!;
    const payload = mapCmsResourceToDbForSeed(resource);

    expect(payload.published_at).toMatch(/T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(payload.slug).toBe(resource.slug);
  });

  it('maps calculator metadata without non-uuid ids', () => {
    const calculator = seedCmsCalculators()[0]!;
    const payload = mapCmsCalculatorToDbForSeed(calculator);

    expect(payload.id).toBeUndefined();
    expect(payload.calculator_slug).toBe(calculator.slug);
    expect(payload.status).toBe(calculator.published ? 'ready' : 'planned');
  });
});
