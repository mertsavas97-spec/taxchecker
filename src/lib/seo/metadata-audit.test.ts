import { describe, expect, it } from 'vitest';

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
      expect(entry.title.length).toBeGreaterThan(10);
      expect(entry.title.length).toBeLessThanOrEqual(70);
      expect(entry.description.length).toBeGreaterThan(50);
      expect(entry.description.length).toBeLessThanOrEqual(165);
    }
  });
});
