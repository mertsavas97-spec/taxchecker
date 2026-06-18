import { getCalculatorBySlug } from '@/config/calculators';
import { getResourceBySlug } from '@/config/resources';
import { site } from '@/config/site';

const TAXCHECKER_HOSTS = new Set([site.domain, `www.${site.domain}`]);

function normalizePath(path: string): string {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

function isTaxCheckerHostname(hostname: string): boolean {
  return TAXCHECKER_HOSTS.has(hostname);
}

/** Normalize CMS or legacy absolute TaxChecker URLs to the configured production host. */
export function normalizeTaxCheckerAbsoluteUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (!isTaxCheckerHostname(parsed.hostname)) {
      return url;
    }

    return absoluteUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`);
  } catch {
    return url;
  }
}

/** Resolve metadata paths, preferring relative routes for on-site canonicals. */
export function resolveMetadataPath(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) {
    return '/';
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (isTaxCheckerHostname(parsed.hostname)) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
      }
      return trimmed;
    } catch {
      return normalizePath(trimmed);
    }
  }

  return normalizePath(trimmed);
}

/** Absolute URL on the production domain */
export function absoluteUrl(path: string = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return normalizeTaxCheckerAbsoluteUrl(path);
  }

  const normalized = normalizePath(path);
  const base = site.productionUrl.replace(/\/$/, '');
  if (normalized === '/') {
    return base;
  }
  return `${base}${normalized}`;
}

/** Canonical URL for a path (alias of absoluteUrl for metadata) */
export function canonicalUrl(path: string): string {
  const resolvedPath = resolveMetadataPath(path);
  if (resolvedPath.startsWith('http://') || resolvedPath.startsWith('https://')) {
    return normalizeTaxCheckerAbsoluteUrl(resolvedPath);
  }
  return absoluteUrl(resolvedPath);
}

/** Resolve calculator URL from registry slug or path */
export function calculatorUrl(slug: string): string {
  if (slug.startsWith('http')) {
    return normalizeTaxCheckerAbsoluteUrl(slug);
  }
  if (slug.startsWith('/')) {
    return absoluteUrl(slug);
  }

  const calculator = getCalculatorBySlug(slug);
  if (calculator) {
    return absoluteUrl(calculator.route);
  }

  return absoluteUrl(`/calculators/${slug}`);
}

/** Resolve resource URL from registry slug or path */
export function resourceUrl(slug: string): string {
  if (slug.startsWith('http')) {
    return normalizeTaxCheckerAbsoluteUrl(slug);
  }
  if (slug.startsWith('/')) {
    return absoluteUrl(slug);
  }

  const resource = getResourceBySlug(slug);
  if (resource) {
    return absoluteUrl(resource.route);
  }

  return absoluteUrl(`/resources/${slug}`);
}

export function blogUrl(slug: string): string {
  if (slug.startsWith('http')) {
    return normalizeTaxCheckerAbsoluteUrl(slug);
  }
  if (slug.startsWith('/')) {
    return absoluteUrl(slug);
  }
  return absoluteUrl(`/blog/${slug}`);
}

export function ogImageUrl(path?: string): string {
  const imagePath = path ?? site.defaultOgImage;
  if (imagePath.startsWith('http')) {
    return normalizeTaxCheckerAbsoluteUrl(imagePath);
  }
  return absoluteUrl(imagePath);
}
