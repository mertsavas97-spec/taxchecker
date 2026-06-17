import type { Metadata } from 'next';

import { BlogHubFilter } from '@/components/blog/blog-hub-filter';
import { HubPageHeader } from '@/components/layout/hub-page-header';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getFeaturedPublishedBlogPost,
  getPublishedBlogPosts,
} from '@/lib/blog/public';
import { buildBlogHubMetadata } from '@/lib/seo/metadata';
import {
  buildBlogCollectionSchema,
  buildBlogHubBreadcrumbs,
} from '@/lib/seo/schema';

export function generateMetadata(): Metadata {
  return buildBlogHubMetadata();
}

export default async function BlogHubPage() {
  const posts = await getPublishedBlogPosts();
  const featuredPost = await getFeaturedPublishedBlogPost();

  const hubPosts = posts.filter((post) => post.id !== featuredPost?.id);

  const jsonLd = [
    buildBlogHubBreadcrumbs(),
    buildBlogCollectionSchema(
      posts.map((post) => ({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
      })),
    ),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="blog-hub" />

      <Section spacing="xs" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <HubPageHeader
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Blog' },
            ]}
            eyebrow="Blog"
            title="Tax updates & planning"
            description="Federal tax updates, freelancer planning notes, and IRS-related explainers. Educational content reviewed against public IRS sources where applicable — not personalized tax advice."
          />
        </PageContainer>
      </Section>

      <Section spacing="sm">
        <PageContainer width="page">
          <BlogHubFilter posts={hubPosts} featuredPost={featuredPost} />
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
