import { describe, expect, it } from 'vitest';

import {
  APEX_HOSTNAME,
  buildCanonicalRedirectUrl,
  CANONICAL_HOSTNAME,
  CANONICAL_ORIGIN,
  CANONICAL_REDIRECT_STATUS,
  isCanonicalHost,
  isVercelPreviewHost,
  nonCanonicalRedirectHeaders,
  NON_CANONICAL_ROBOTS_HEADER,
  resolveHostPolicy,
  shouldNoIndexHost,
  shouldRedirectToCanonical,
} from '@/lib/seo/host-canonicalization';

describe('host canonicalization policy', () => {
  it('uses www.taxchecker.app as the canonical hostname', () => {
    expect(CANONICAL_HOSTNAME).toBe('www.taxchecker.app');
    expect(CANONICAL_ORIGIN).toBe('https://www.taxchecker.app');
  });

  it('passes canonical and local dev hosts through', () => {
    expect(resolveHostPolicy('www.taxchecker.app')).toEqual({ action: 'pass' });
    expect(resolveHostPolicy('localhost')).toEqual({ action: 'pass' });
    expect(resolveHostPolicy('127.0.0.1:3000')).toEqual({ action: 'pass' });
    expect(isCanonicalHost('www.taxchecker.app')).toBe(true);
  });

  it('redirects apex and production vercel alias hosts', () => {
    expect(resolveHostPolicy(APEX_HOSTNAME)).toEqual({ action: 'redirect' });
    expect(resolveHostPolicy('taxchecker.vercel.app')).toEqual({ action: 'redirect' });
    expect(shouldRedirectToCanonical('taxchecker.app')).toBe(true);
    expect(shouldRedirectToCanonical('taxchecker.vercel.app')).toBe(true);
  });

  it('noindexes preview and branch vercel deployments without redirecting', () => {
    expect(
      resolveHostPolicy('taxchecker-git-feature-user.vercel.app'),
    ).toEqual({ action: 'noindex' });
    expect(
      resolveHostPolicy('taxchecker-app-preview-123.vercel.app'),
    ).toEqual({ action: 'noindex' });
    expect(isVercelPreviewHost('taxchecker-git-feature-user.vercel.app')).toBe(true);
    expect(shouldRedirectToCanonical('taxchecker-git-feature-user.vercel.app')).toBe(
      false,
    );
  });

  it('marks redirect hosts for noindex response headers', () => {
    expect(shouldNoIndexHost('taxchecker.vercel.app')).toBe(true);
    expect(shouldNoIndexHost('taxchecker-git-feature-user.vercel.app')).toBe(true);
    expect(shouldNoIndexHost('www.taxchecker.app')).toBe(false);
  });

  it('builds canonical redirect URLs on www', () => {
    expect(
      buildCanonicalRedirectUrl('https://taxchecker.vercel.app/blog/example?q=1').toString(),
    ).toBe('https://www.taxchecker.app/blog/example?q=1');
    expect(
      buildCanonicalRedirectUrl('https://taxchecker.app/calculators').toString(),
    ).toBe('https://www.taxchecker.app/calculators');
  });

  it('includes X-Robots-Tag on redirect header sets', () => {
    const headers = nonCanonicalRedirectHeaders('https://www.taxchecker.app/blog');
    expect(headers).toEqual({
      Location: 'https://www.taxchecker.app/blog',
      'X-Robots-Tag': NON_CANONICAL_ROBOTS_HEADER,
    });
    expect(CANONICAL_REDIRECT_STATUS).toBe(308);
  });
});
