import { describe, expect, it } from 'vitest';

import { buildOrganizationSchema } from '@/lib/seo/schema/organization';
import { buildWebsiteSchema } from '@/lib/seo/schema/website';
import { absoluteUrl, canonicalUrl } from '@/lib/seo/urls';

const CANONICAL_HOST = 'https://www.taxchecker.app';

describe('SEO schema host alignment', () => {
  it('uses www in Organization JSON-LD', () => {
    const schema = buildOrganizationSchema();

    expect(schema.url).toBe(CANONICAL_HOST);
    expect(schema.logo).toBe(`${CANONICAL_HOST}/brand/taxchecker-logo.png`);
    expect(schema.contactPoint.url).toBe(`${CANONICAL_HOST}/contact`);
  });

  it('uses www in WebSite JSON-LD', () => {
    const schema = buildWebsiteSchema();

    expect(schema.url).toBe(CANONICAL_HOST);
    expect(schema.publisher.url).toBe(CANONICAL_HOST);
  });

  it('uses www in breadcrumb JSON-LD item URLs', () => {
    expect(absoluteUrl('/blog/example')).toBe(`${CANONICAL_HOST}/blog/example`);
    expect(canonicalUrl('/blog/example')).toBe(`${CANONICAL_HOST}/blog/example`);
  });
});
