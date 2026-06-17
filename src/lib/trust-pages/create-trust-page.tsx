import type { Metadata } from 'next';

import { StaticPageLayout } from '@/components/content/static-page-layout';
import {
  getTrustPageBySlug,
  type TrustPageDefinition,
  type TrustPageSlug,
} from '@/config/trust-pages';
import { getTrustPageContent } from '@/lib/content/trust-page-content';
import { buildStaticPageMetadata } from '@/lib/seo/metadata';

export function createTrustPageMetadata(slug: TrustPageSlug): Metadata {
  const page = getTrustPageBySlug(slug);
  if (!page) {
    throw new Error(`Unknown trust page slug: ${slug}`);
  }
  return buildStaticPageMetadata(page);
}

export function createTrustPage(slug: TrustPageSlug) {
  const pageDef = getTrustPageBySlug(slug);
  if (!pageDef) {
    throw new Error(`Unknown trust page slug: ${slug}`);
  }

  const page: TrustPageDefinition = pageDef;
  const content = getTrustPageContent(slug);

  function TrustPage() {
    return <StaticPageLayout page={page} content={content} />;
  }

  return TrustPage;
}
