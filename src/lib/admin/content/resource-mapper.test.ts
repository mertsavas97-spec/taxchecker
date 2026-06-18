import { describe, expect, it } from 'vitest';

import {
  mapCmsResourceToDb,
  mapDbResourceToCms,
  type DbCmsResource,
} from '@/lib/admin/content/storage/mappers';
import { seedCmsResources } from '@/lib/admin/content/seed';
import type { CmsResource } from '@/lib/admin/content/types';

describe('resource mapper round trip', () => {
  it('preserves core CMS resource fields through db mapping', () => {
    const seed = seedCmsResources()[0]!;
    const withBody: CmsResource = {
      ...seed,
      content: 'Updated CMS body content for testing mapper round trip.',
      canonicalUrl: '/resources/example',
      ogImage: '/og/resources/example.png',
      relatedBlogSlugs: ['self-employment-tax-explained'],
    };

    const dbRow = {
      ...mapCmsResourceToDb(withBody),
      id: '11111111-1111-1111-1111-111111111111',
      updated_at: '2026-06-16T12:00:00.000Z',
    } as DbCmsResource;

    const restored = mapDbResourceToCms(dbRow);

    expect(restored.slug).toBe(withBody.slug);
    expect(restored.title).toBe(withBody.title);
    expect(restored.description).toBe(withBody.description);
    expect(restored.content).toBe(withBody.content);
    expect(restored.relatedBlogSlugs).toEqual(withBody.relatedBlogSlugs);
    expect(restored.canonicalUrl).toBe(withBody.canonicalUrl);
    expect(restored.ogImage).toBe(withBody.ogImage);
    expect(restored.sourceIds).toEqual(withBody.sourceIds);
  });
});

describe('resource seed slug safety', () => {
  it('does not duplicate resource slugs in seed data', () => {
    const slugs = seedCmsResources().map((row) => row.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
