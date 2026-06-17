import type { Metadata } from 'next';

import { calculators } from '@/config/calculators';
import { resources } from '@/config/resources';
import { site } from '@/config/site';
import { getLaunchBlogPosts } from '@/lib/blog/launch-articles';
import { ogPaths } from '@/lib/og/paths';
import { ogImageUrl } from '@/lib/seo/urls';
import {
  buildArticleMetadata,
  buildCalculatorMetadata,
  buildHomeMetadata,
  buildResourceMetadata,
} from '@/lib/seo/metadata';

export type OgCoverageEntry = {
  pageType: 'homepage' | 'calculator' | 'resource' | 'blog' | 'hub';
  path: string;
  title: string;
  ogImagePath: string;
  ogImageUrl: string;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
};

function hasOgImage(metadata: Metadata): { openGraph: boolean; twitter: boolean } {
  const ogImages = metadata.openGraph?.images;
  const twitterImages = metadata.twitter?.images;

  const ogImageList = Array.isArray(ogImages) ? ogImages : ogImages ? [ogImages] : [];
  const twitterImageList = Array.isArray(twitterImages)
    ? twitterImages
    : twitterImages
      ? [twitterImages]
      : [];

  const twitterCard =
    metadata.twitter && 'card' in metadata.twitter ? metadata.twitter.card : undefined;

  return {
    openGraph: ogImageList.length > 0,
    twitter: twitterCard === 'summary_large_image' && twitterImageList.length > 0,
  };
}

function toEntry(
  pageType: OgCoverageEntry['pageType'],
  path: string,
  title: string,
  ogImagePath: string,
  flags: { openGraph: boolean; twitter: boolean },
): OgCoverageEntry {
  return {
    pageType,
    path,
    title,
    ogImagePath,
    ogImageUrl: ogImageUrl(ogImagePath),
    hasOpenGraph: flags.openGraph,
    hasTwitterCard: flags.twitter,
  };
}

/** Audit dynamic OG metadata coverage for launch content types. */
export function auditOgMetadataCoverage(): OgCoverageEntry[] {
  const entries: OgCoverageEntry[] = [];

  const home = buildHomeMetadata();
  const homeFlags = hasOgImage(home);
  entries.push(
    toEntry('homepage', '/', site.defaultTitle, ogPaths.home, homeFlags),
  );

  for (const calculator of calculators.filter((item) => item.status === 'ready')) {
    const metadata = buildCalculatorMetadata(calculator);
    const ogImagePath = ogPaths.calculator(calculator.engineId);
    entries.push(
      toEntry(
        'calculator',
        calculator.route,
        calculator.title,
        ogImagePath,
        hasOgImage(metadata),
      ),
    );
  }

  for (const resource of resources.filter((item) => item.status === 'published')) {
    const metadata = buildResourceMetadata(resource);
    const ogImagePath = ogPaths.resource(resource.slug);
    entries.push(
      toEntry(
        'resource',
        resource.route,
        resource.title,
        ogImagePath,
        hasOgImage(metadata),
      ),
    );
  }

  for (const post of getLaunchBlogPosts()) {
    const metadata = buildArticleMetadata({
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      slug: post.slug,
      publishedAt: post.publishedAt ?? post.updatedAt,
      modifiedAt: post.updatedAt,
    });
    const ogImagePath = ogPaths.blog(post.slug);
    entries.push(
      toEntry(
        'blog',
        `/blog/${post.slug}`,
        post.title,
        ogImagePath,
        hasOgImage(metadata),
      ),
    );
  }

  return entries;
}

export function summarizeOgMetadataCoverage(entries: OgCoverageEntry[] = auditOgMetadataCoverage()) {
  const total = entries.length;
  const withOg = entries.filter((entry) => entry.hasOpenGraph).length;
  const withTwitter = entries.filter((entry) => entry.hasTwitterCard).length;

  return {
    total,
    withOpenGraph: withOg,
    withTwitterCard: withTwitter,
    coveragePercent: total > 0 ? Math.round((withOg / total) * 100) : 0,
    complete: withOg === total && withTwitter === total,
  };
}
