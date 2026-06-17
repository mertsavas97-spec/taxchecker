import type { Metadata } from 'next';

import { HomeAuthorityStrip } from '@/components/home/home-authority-strip';
import { HomeFeaturedArticle } from '@/components/home/home-featured-article';
import {
  HomeFeaturedCalculators,
  HomeHero,
  HomeLatestResources,
  HomeMethodology,
  HomeWhyTaxChecker,
} from '@/components/home/home-sections';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { getFeaturedPublishedBlogPost } from '@/lib/blog/public';
import { buildHomeMetadata } from '@/lib/seo/metadata';
import {
  buildOrganizationSchema,
  buildWebsiteSchema,
} from '@/lib/seo/schema';

export function generateMetadata(): Metadata {
  return buildHomeMetadata();
}

export default async function HomePage() {
  const featuredPost = await getFeaturedPublishedBlogPost();
  const jsonLd = [buildOrganizationSchema(), buildWebsiteSchema()];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="homepage" />
      <HomeHero />
      <HomeAuthorityStrip />
      <HomeFeaturedCalculators />
      {featuredPost ? (
        <Section spacing="sm">
          <PageContainer width="page">
            <HomeFeaturedArticle post={featuredPost} />
          </PageContainer>
        </Section>
      ) : null}
      <HomeLatestResources />
      <HomeWhyTaxChecker />
      <HomeMethodology />
    </SiteShell>
  );
}
