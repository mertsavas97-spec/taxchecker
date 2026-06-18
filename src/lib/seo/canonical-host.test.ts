import { beforeEach, describe, expect, it, vi } from 'vitest';

import robots from '@/app/robots';
import { site } from '@/config/site';
import { buildArticleMetadata, buildHomeMetadata } from '@/lib/seo/metadata';
import {
  absoluteUrl,
  canonicalUrl,
  normalizeTaxCheckerAbsoluteUrl,
  ogImageUrl,
  resolveMetadataPath,
} from '@/lib/seo/urls';

const CANONICAL_HOST = 'https://www.taxchecker.app';
const LEGACY_APEX_HOST = 'https://taxchecker.app';

vi.mock('@/lib/blog/public', () => ({
  getPublishedBlogPosts: vi.fn(async () => []),
}));

vi.mock('@/lib/cms/public-read', () => ({
  getSitemapResourcesPublic: vi.fn(async () => []),
}));

describe('canonical host alignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses www as the configured production host', () => {
    expect(site.productionUrl).toBe(CANONICAL_HOST);
    expect(site.organization.url).toBe(CANONICAL_HOST);
    expect(site.organization.logo).toBe(`${CANONICAL_HOST}/brand/taxchecker-logo.png`);
  });

  it('builds homepage metadata on www', () => {
    const metadata = buildHomeMetadata();

    expect(metadata.metadataBase?.toString()).toBe(`${CANONICAL_HOST}/`);
    expect(metadata.alternates?.canonical).toBe(CANONICAL_HOST);
    expect(metadata.openGraph?.url).toBe(CANONICAL_HOST);

    const openGraphImages = metadata.openGraph?.images;
    const openGraphImage = Array.isArray(openGraphImages)
      ? openGraphImages[0]
      : openGraphImages;
    expect(openGraphImage).toMatchObject({
      url: `${CANONICAL_HOST}/og/home`,
    });

    const twitterImages = metadata.twitter?.images;
    const twitterImage = Array.isArray(twitterImages) ? twitterImages[0] : twitterImages;
    expect(twitterImage).toMatchObject({
      url: `${CANONICAL_HOST}/og/home`,
    });
  });

  it('normalizes legacy apex CMS canonical URLs to www', () => {
    expect(resolveMetadataPath(`${LEGACY_APEX_HOST}/blog/example`)).toBe('/blog/example');
    expect(canonicalUrl(`${LEGACY_APEX_HOST}/blog/example`)).toBe(
      `${CANONICAL_HOST}/blog/example`,
    );
    expect(normalizeTaxCheckerAbsoluteUrl(`${LEGACY_APEX_HOST}/og/home`)).toBe(
      `${CANONICAL_HOST}/og/home`,
    );
  });

  it('does not emit apex URLs from SEO URL helpers', () => {
    expect(absoluteUrl('/')).toBe(CANONICAL_HOST);
    expect(absoluteUrl('/calculators')).toBe(`${CANONICAL_HOST}/calculators`);
    expect(ogImageUrl('/og/home')).toBe(`${CANONICAL_HOST}/og/home`);
    expect(canonicalUrl('/resources')).toBe(`${CANONICAL_HOST}/resources`);

    for (const url of [
      absoluteUrl('/'),
      canonicalUrl('/blog/example'),
      ogImageUrl('/og/home'),
    ]) {
      expect(url.startsWith(CANONICAL_HOST)).toBe(true);
      expect(url.startsWith(LEGACY_APEX_HOST)).toBe(false);
    }
  });

  it('builds blog article metadata with www canonical and social URLs', () => {
    const metadata = buildArticleMetadata({
      title: 'Example blog post',
      description: 'Example description for canonical host testing on blog posts.',
      slug: 'example-post',
      path: `${LEGACY_APEX_HOST}/blog/example-post`,
      publishedAt: '2026-06-16',
      modifiedAt: '2026-06-16',
    });

    expect(metadata.alternates?.canonical).toBe(`${CANONICAL_HOST}/blog/example-post`);
    expect(metadata.openGraph?.url).toBe(`${CANONICAL_HOST}/blog/example-post`);
  });

  it('uses www in robots.txt sitemap and host directives', () => {
    const result = robots();
    const sitemapUrl = Array.isArray(result.sitemap) ? result.sitemap[0] : result.sitemap;

    expect(sitemapUrl).toBe(`${CANONICAL_HOST}/sitemap.xml`);
    expect(result.host).toBe(CANONICAL_HOST);
    expect(typeof sitemapUrl === 'string' && sitemapUrl.startsWith(LEGACY_APEX_HOST)).toBe(false);
  });

  it('uses www for all sitemap entries', async () => {
    const sitemap = (await import('@/app/sitemap')).default;
    const entries = await sitemap();

    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.url.startsWith(CANONICAL_HOST)).toBe(true);
      expect(entry.url.startsWith(LEGACY_APEX_HOST)).toBe(false);
    }
  });
});
