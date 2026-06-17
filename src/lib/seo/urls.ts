import { getCalculatorBySlug } from '@/config/calculators';
import { getResourceBySlug } from '@/config/resources';
import { site } from '@/config/site';

function normalizePath(path: string): string {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

/** Absolute URL on the production domain */
export function absoluteUrl(path: string = '/'): string {
  const normalized = normalizePath(path);
  const base = site.productionUrl.replace(/\/$/, '');
  if (normalized === '/') {
    return base;
  }
  return `${base}${normalized}`;
}

/** Canonical URL for a path (alias of absoluteUrl for metadata) */
export function canonicalUrl(path: string): string {
  return absoluteUrl(path);
}

/** Resolve calculator URL from registry slug or path */
export function calculatorUrl(slug: string): string {
  if (slug.startsWith('http')) {
    return slug;
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
    return slug;
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
    return slug;
  }
  if (slug.startsWith('/')) {
    return absoluteUrl(slug);
  }
  return absoluteUrl(`/blog/${slug}`);
}

export function ogImageUrl(path?: string): string {
  const imagePath = path ?? site.defaultOgImage;
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return absoluteUrl(imagePath);
}
