import { describe, expect, it } from 'vitest';

import { getCalculatorByEngineId } from '@/config/calculators';
import { getResourceBySlug } from '@/config/resources';
import { site } from '@/config/site';
import {
  auditOgMetadataCoverage,
  summarizeOgMetadataCoverage,
} from '@/lib/og/metadata-audit';
import { ogPaths } from '@/lib/og/paths';
import {
  buildArticleMetadata,
  buildCalculatorMetadata,
  buildHomeMetadata,
  buildResourceMetadata,
} from '@/lib/seo/metadata';
import { ogImageUrl } from '@/lib/seo/urls';

function firstOgImage(metadata: ReturnType<typeof buildHomeMetadata>) {
  const images = metadata.openGraph?.images;
  return Array.isArray(images) ? images[0] : images;
}

function firstTwitterImage(metadata: ReturnType<typeof buildArticleMetadata>) {
  const images = metadata.twitter?.images;
  return Array.isArray(images) ? images[0] : images;
}

describe('ogPaths', () => {
  it('builds stable dynamic OG routes', () => {
    expect(ogPaths.home).toBe('/og/home');
    expect(ogPaths.calculator('self-employed-tax')).toBe(
      '/og/calculators/self-employed-tax',
    );
    expect(ogPaths.resource('tax-brackets-2025')).toBe(
      '/og/resources/tax-brackets-2025',
    );
    expect(ogPaths.blog('self-employment-tax-explained')).toBe(
      '/og/blog/self-employment-tax-explained',
    );
  });
});

describe('metadata OG integration', () => {
  it('sets homepage OG and Twitter metadata', () => {
    const metadata = buildHomeMetadata();
    const image = firstOgImage(metadata);

    expect(image).toMatchObject({
      url: ogImageUrl(ogPaths.home),
      width: 1200,
      height: 630,
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      site: site.twitterHandle,
      creator: site.twitterHandle,
    });
  });

  it('sets calculator-specific OG images', () => {
    const calculator = getCalculatorByEngineId('1099-tax');
    expect(calculator).toBeDefined();

    const metadata = buildCalculatorMetadata(calculator!);
    const image = firstOgImage(metadata);

    expect(image).toMatchObject({
      url: ogImageUrl(ogPaths.calculator('1099-tax')),
      width: 1200,
      height: 630,
      type: 'image/png',
    });
  });

  it('sets resource-specific OG images', () => {
    const resource = getResourceBySlug('self-employment-tax-guide');
    expect(resource).toBeDefined();

    const metadata = buildResourceMetadata(resource!);
    expect(firstOgImage(metadata)).toMatchObject({
      url: ogImageUrl(ogPaths.resource('self-employment-tax-guide')),
    });
  });

  it('defaults blog article OG images to dynamic routes', () => {
    const metadata = buildArticleMetadata({
      title: 'Self-Employment Tax Explained',
      description: 'How SE tax works for freelancers.',
      slug: 'self-employment-tax-explained',
      publishedAt: '2026-06-01',
    });

    expect(metadata.openGraph && 'type' in metadata.openGraph && metadata.openGraph.type).toBe(
      'article',
    );
    expect(firstOgImage(metadata)).toMatchObject({
      url: ogImageUrl(ogPaths.blog('self-employment-tax-explained')),
    });
    expect(firstTwitterImage(metadata)).toMatchObject({
      url: ogImageUrl(ogPaths.blog('self-employment-tax-explained')),
    });
  });
});

describe('auditOgMetadataCoverage', () => {
  it('covers homepage, calculators, resources, and blog articles', () => {
    const entries = auditOgMetadataCoverage();
    const summary = summarizeOgMetadataCoverage(entries);

    expect(entries.some((entry) => entry.pageType === 'homepage')).toBe(true);
    expect(entries.filter((entry) => entry.pageType === 'calculator').length).toBeGreaterThanOrEqual(8);
    expect(entries.filter((entry) => entry.pageType === 'resource').length).toBeGreaterThanOrEqual(4);
    expect(entries.filter((entry) => entry.pageType === 'blog').length).toBeGreaterThanOrEqual(10);
    expect(summary.complete).toBe(true);
    expect(summary.coveragePercent).toBe(100);
  });
});
