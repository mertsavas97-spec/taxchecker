import type { Metadata } from 'next';

import { BlogHubFilter } from '@/components/blog/blog-hub-filter';
import { HubPageHeader } from '@/components/layout/hub-page-header';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getFeaturedPublishedBlogPost,
  getBlogHubStoreDriverLabel,
  resolvePublishedBlogPosts,
} from '@/lib/blog/public';
import { logBlogHubDebugInDevelopment } from '@/lib/blog/hub-listing';
import {
  clampBlogHubPage,
  getBlogHubPaginationMeta,
  parseBlogHubPageParam,
} from '@/lib/blog/pagination';
import { buildBlogHubMetadata } from '@/lib/seo/metadata';
import {
  buildBlogCollectionSchema,
  buildBlogHubBreadcrumbs,
} from '@/lib/seo/schema';
import { isSupabasePublicReadConfigured } from '@/lib/supabase/public-read';

export function generateMetadata(): Metadata {
  return buildBlogHubMetadata();
}

export const dynamic = 'force-dynamic';

interface BlogHubPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogHubPage({ searchParams }: BlogHubPageProps) {
  const { page: pageParam } = await searchParams;
  const { posts, source } = await resolvePublishedBlogPosts();
  const featuredPost = await getFeaturedPublishedBlogPost();

  const hubPosts = posts.filter((post) => post.id !== featuredPost?.id);
  const pagination = getBlogHubPaginationMeta(hubPosts.length);
  const currentPage = clampBlogHubPage(
    parseBlogHubPageParam(pageParam),
    pagination.totalPages,
  );

  logBlogHubDebugInDevelopment({
    source,
    totalReturned: posts.length,
    publishedCount: posts.length,
    featuredSlug: featuredPost?.slug ?? null,
    gridPostCount: hubPosts.length,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
    slugs: posts.slice(0, 15).map((post) => post.slug),
    supabaseConfigured: isSupabasePublicReadConfigured(),
    adminContentStore: getBlogHubStoreDriverLabel(),
  });

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
          <BlogHubFilter
            posts={hubPosts}
            featuredPost={featuredPost}
            currentPage={currentPage}
          />
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
