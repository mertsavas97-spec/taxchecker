import { describe, expect, it } from 'vitest';

import { isValidBlogSlug, normalizeBlogSlug } from '@/lib/admin/blog/slug';

describe('blog slug helpers', () => {
  it('normalizes titles into URL slugs', () => {
    expect(normalizeBlogSlug('  Hello World!  ')).toBe('hello-world');
  });

  it('accepts valid slugs', () => {
    expect(isValidBlogSlug('quarterly-tax-payments')).toBe(true);
    expect(isValidBlogSlug('1099-tax-2026')).toBe(true);
  });

  it('rejects missing or invalid slugs', () => {
    expect(isValidBlogSlug('')).toBe(false);
    expect(isValidBlogSlug('   ')).toBe(false);
    expect(isValidBlogSlug('Bad Slug')).toBe(false);
    expect(isValidBlogSlug('-leading')).toBe(false);
    expect(isValidBlogSlug('trailing-')).toBe(false);
  });
});
