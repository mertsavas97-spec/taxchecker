import type { Metadata } from 'next';

import type { CalculatorDefinition } from '@/config/calculators';
import type { ResourceDefinition } from '@/config/resources';
import type { TrustPageDefinition } from '@/config/trust-pages';
import { site } from '@/config/site';
import { ogPaths } from '@/lib/og/paths';
import { absoluteUrl, canonicalUrl, ogImageUrl, resolveMetadataPath } from '@/lib/seo/urls';

export interface MetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noindex?: boolean;
  keywords?: string[];
  /** When true, title is already fully branded (e.g. homepage) */
  absoluteTitle?: boolean;
}

function socialTitle(title: string, absoluteTitle?: boolean): string {
  if (absoluteTitle || title.includes(`| ${site.siteName}`)) {
    return title;
  }
  return `${title} | ${site.siteName}`;
}

export interface ArticleMetadataInput {
  title: string;
  description: string;
  slug: string;
  path?: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
  ogImage?: string;
  noindex?: boolean;
  keywords?: string[];
}

function buildRobots(noindex?: boolean): Metadata['robots'] {
  if (noindex) {
    return {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  };
}

function buildOpenGraph({
  title,
  description,
  path = '/',
  ogImage,
  absoluteTitle,
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  absoluteTitle?: boolean;
}): Metadata['openGraph'] {
  const resolvedTitle = socialTitle(title, absoluteTitle);

  return {
    type: 'website',
    locale: site.defaultLocale,
    url: canonicalUrl(path),
    siteName: site.siteName,
    title: resolvedTitle,
    description,
    images: [
      {
        url: ogImageUrl(ogImage),
        width: 1200,
        height: 630,
        alt: `${resolvedTitle} — TaxChecker`,
        type: 'image/png',
      },
    ],
  };
}

function buildTwitterCard({
  title,
  description,
  ogImage,
  absoluteTitle,
}: {
  title: string;
  description: string;
  ogImage?: string;
  absoluteTitle?: boolean;
}): Metadata['twitter'] {
  const resolvedTitle = socialTitle(title, absoluteTitle);

  return {
    card: 'summary_large_image',
    title: resolvedTitle,
    description,
    images: [
      {
        url: ogImageUrl(ogImage),
        alt: `${resolvedTitle} — TaxChecker`,
      },
    ],
  };
}

function assembleMetadata(
  title: string,
  description: string,
  options: MetadataOptions = {},
): Metadata {
  const path = resolveMetadataPath(options.path ?? '/');

  return {
    title,
    description,
    metadataBase: new URL(site.productionUrl),
    alternates: {
      canonical: canonicalUrl(path),
    },
    openGraph: buildOpenGraph({
      title,
      description,
      path,
      ogImage: options.ogImage,
      absoluteTitle: options.absoluteTitle,
    }),
    twitter: buildTwitterCard({
      title,
      description,
      ogImage: options.ogImage,
      absoluteTitle: options.absoluteTitle,
    }),
    robots: buildRobots(options.noindex),
    ...(options.keywords?.length
      ? { keywords: options.keywords }
      : {}),
  };
}

/** Favicon and PWA icon metadata for the root layout */
export function buildSiteIcons(): Metadata['icons'] {
  return {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    other: [
      {
        rel: 'icon',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

/** Site-wide default metadata for root layout */
export function buildDefaultMetadata(): Metadata {
  return {
    ...assembleMetadata(site.defaultTitle, site.defaultDescription, {
      path: '/',
    }),
    title: {
      default: site.defaultTitle,
      template: site.titleTemplate,
    },
    applicationName: site.siteName,
    authors: [{ name: site.organization.name, url: site.organization.url }],
    creator: site.organization.name,
    publisher: site.organization.name,
    icons: buildSiteIcons(),
    manifest: '/site.webmanifest',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}

export function buildCalculatorMetadata(
  calculator: CalculatorDefinition,
  options: Pick<MetadataOptions, 'noindex' | 'ogImage'> = {},
): Metadata {
  const keywords = [calculator.primaryKeyword, ...calculator.secondaryKeywords];

  return assembleMetadata(calculator.title, calculator.description, {
    path: calculator.route,
    keywords,
    noindex: options.noindex ?? calculator.status !== 'ready',
    ogImage: options.ogImage ?? ogPaths.calculator(calculator.engineId),
  });
}

export function buildResourceMetadata(
  resource: ResourceDefinition,
  options: Pick<MetadataOptions, 'noindex' | 'ogImage'> = {},
): Metadata {
  const keywords = [resource.primaryKeyword, ...resource.secondaryKeywords];

  return assembleMetadata(resource.title, resource.description, {
    path: resource.route,
    keywords,
    noindex: options.noindex ?? resource.status !== 'published',
    ogImage: options.ogImage ?? ogPaths.resource(resource.slug),
  });
}

export function buildArticleMetadata(article: ArticleMetadataInput): Metadata {
  const path = resolveMetadataPath(article.path ?? blogUrlPath(article.slug));
  const keywords = article.keywords ?? [];

  const metadata = assembleMetadata(article.title, article.description, {
    path,
    keywords,
    noindex: article.noindex,
    ogImage: article.ogImage ?? ogPaths.blog(article.slug),
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.modifiedAt ?? article.publishedAt,
      authors: article.authorName ? [article.authorName] : [site.organization.name],
    },
  };
}

function blogUrlPath(slug: string): string {
  return slug.startsWith('/') ? slug : `/blog/${slug}`;
}

/** Homepage metadata */
export function buildHomeMetadata(): Metadata {
  return {
    ...assembleMetadata(site.defaultTitle, site.defaultDescription, {
      path: '/',
      ogImage: ogPaths.home,
      absoluteTitle: true,
    }),
    title: {
      absolute: site.defaultTitle,
    },
  };
}

export function buildStaticPageMetadata(
  page: TrustPageDefinition,
  options: Pick<MetadataOptions, 'noindex' | 'ogImage'> = {},
): Metadata {
  return assembleMetadata(page.title, page.description, {
    path: page.route,
    noindex: options.noindex ?? page.placeholder === true,
    ogImage: options.ogImage ?? ogPaths.page(page.slug),
  });
}

export function buildCalculatorsHubMetadata(): Metadata {
  return assembleMetadata(
    'Free Federal Tax Calculators',
    'Browse self-employment, 1099, quarterly estimated tax, LLC vs S Corp, HSA, and W-2 vs 1099 calculators. Federal estimates from IRS publications—not tax advice.',
    {
      path: '/calculators',
      ogImage: ogPaths.hubCalculators,
      keywords: [
        'federal tax calculators',
        'self employment tax calculator',
        'quarterly tax calculator',
        '1099 tax calculator',
      ],
    },
  );
}

export function buildResourcesHubMetadata(): Metadata {
  return assembleMetadata(
    'Federal Tax Guides & Reference',
    'Self-employment tax guides, quarterly payment basics, federal tax brackets, and Form 1040-ES due dates from IRS publications—not tax advice.',
    {
      path: '/resources',
      ogImage: ogPaths.hubResources,
      keywords: [
        'federal tax guides',
        'quarterly tax deadlines 2025',
        '2025 federal tax brackets',
        'tax calculator methodology',
      ],
    },
  );
}

export function buildBlogHubMetadata(): Metadata {
  return assembleMetadata(
    'Federal Tax Planning Blog',
    'Plain-language articles on self-employment tax, 1099 contractors, quarterly payments, LLC vs S Corp, and federal brackets—from IRS publications. Not tax advice.',
    {
      path: '/blog',
      ogImage: ogPaths.hubBlog,
      keywords: [
        'self employment tax blog',
        '1099 contractor tax guide',
        'quarterly estimated tax articles',
        'LLC vs S Corp explained',
        '2025 federal tax brackets',
      ],
    },
  );
}

export { absoluteUrl };
