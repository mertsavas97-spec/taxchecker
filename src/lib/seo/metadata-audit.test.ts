import { describe, expect, it } from 'vitest';

import type { Metadata } from 'next';

import { site } from '@/config/site';
import {
  buildDefaultMetadata,
  buildHomeMetadata,
} from '@/lib/seo/metadata';
import {
  collectMetadataAuditEntries,
  findDuplicateDescriptions,
  findDuplicateTitles,
  summarizeMetadataAudit,
} from '@/lib/seo/metadata-audit';

describe('metadata audit', () => {
  it('covers homepage, hubs, calculators, resources, blog, and trust pages', () => {
    const entries = collectMetadataAuditEntries();
    const paths = entries.map((entry) => entry.path);

    expect(paths).toContain('/');
    expect(paths).toContain('/calculators');
    expect(paths).toContain('/resources');
    expect(paths).toContain('/blog');
    expect(paths).toContain('/about');
    expect(paths).toContain('/sources');
    expect(paths).toContain('/editorial-standards');
    expect(paths).toContain('/methodology');
    expect(entries.filter((entry) => entry.pageType === 'calculator').length).toBe(8);
    expect(entries.filter((entry) => entry.pageType === 'blog').length).toBeGreaterThanOrEqual(10);
  });

  it('has no duplicate titles or descriptions after CTR optimization', () => {
    const entries = collectMetadataAuditEntries();
    const summary = summarizeMetadataAudit(entries);

    expect(findDuplicateTitles(entries)).toEqual([]);
    expect(findDuplicateDescriptions(entries)).toEqual([]);
    expect(summary.duplicateTitles).toBe(0);
    expect(summary.duplicateDescriptions).toBe(0);
  });

  it('keeps descriptions within a reasonable SERP snippet range', () => {
    const entries = collectMetadataAuditEntries();

    for (const entry of entries) {
      expect(entry.title.length).toBeGreaterThanOrEqual(7);
      expect(entry.title.length).toBeLessThanOrEqual(70);
      expect(entry.description.length).toBeGreaterThan(50);
      expect(entry.description.length).toBeLessThanOrEqual(165);
    }
  });

  it('uses the branded homepage title without a duplicate suffix', () => {
    const home = collectMetadataAuditEntries().find((entry) => entry.path === '/');
    expect(home?.title).toBe('TaxChecker — Free Federal Tax Calculators');
  });
});

describe('site icons metadata', () => {
  function getIconsRecord(metadata: Metadata) {
    const icons = metadata.icons;
    if (!icons || typeof icons === 'string' || icons instanceof URL || Array.isArray(icons)) {
      throw new Error('Expected structured icons metadata');
    }
    return icons;
  }

  it('references public favicon and PWA assets explicitly', () => {
    const metadata = buildDefaultMetadata();
    const icons = getIconsRecord(metadata);

    const iconEntries = Array.isArray(icons.icon) ? icons.icon : [icons.icon];
    const iconUrls = iconEntries
      .filter(
        (entry): entry is { url: string } =>
          Boolean(entry && typeof entry === 'object' && 'url' in entry),
      )
      .map((entry) => entry.url);

    expect(iconUrls).toContain('/favicon.ico');
    expect(iconUrls).toContain('/favicon-16x16.png');
    expect(iconUrls).toContain('/favicon-32x32.png');
    expect(iconUrls).toContain('/favicon-48x48.png');
    expect(icons.shortcut).toBe('/favicon.ico');
    expect(icons.apple).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: '/apple-touch-icon.png' }),
      ]),
    );
    expect(metadata.manifest).toBe('/site.webmanifest');
  });

  it('aligns homepage OG and Twitter copy with the homepage title and description', () => {
    const metadata = buildHomeMetadata();

    expect(metadata.openGraph?.title).toBe(site.defaultTitle);
    expect(metadata.twitter?.title).toBe(site.defaultTitle);
    expect(metadata.openGraph?.description).toBe(site.defaultDescription);
    expect(metadata.twitter?.description).toBe(site.defaultDescription);
  });
});
