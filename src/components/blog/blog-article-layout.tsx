import Link from 'next/link';
import { CalendarIcon, ClockIcon, UserIcon } from 'lucide-react';

import { RelatedContentBlock } from '@/components/content/related-content-block';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { site } from '@/config/site';
import type { CmsBlogPost } from '@/lib/admin/content/types';
import { BlogContentParagraph } from '@/lib/blog/content';
import { getBlogPostPath, isTaxRelatedBlogPost } from '@/lib/blog/paths';
import { getPublishedBlogPostsPublic } from '@/lib/cms/public-read';
import { buildRelatedContentForBlogPost } from '@/lib/conversion/related-content';
import {
  buildBlogPostingSchema,
  buildBlogPostBreadcrumbs,
} from '@/lib/seo/schema';
import { cn } from '@/lib/utils';

function BlogHero({ post }: { post: CmsBlogPost }) {
  return (
    <header className="tc-reading-width space-y-2">
      <p className="tc-overline">{post.category}</p>
      <h1 className="tc-heading-page text-foreground">{post.title}</h1>
      <p className="text-base leading-relaxed text-muted-foreground">{post.excerpt}</p>
    </header>
  );
}

function BlogMetadataBar({
  post,
  className,
}: {
  post: CmsBlogPost;
  className?: string;
}) {
  return (
    <div
      className={cn('tc-trust-bar', className)}
      aria-label="Article metadata"
    >
      {post.authorName ? (
        <span className="inline-flex items-center gap-1.5">
          <UserIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
          <span>{post.authorName}</span>
        </span>
      ) : null}
      {post.publishedAt ? (
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
          <span>Published {post.publishedAt}</span>
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1.5">
        <ClockIcon className="size-3.5 shrink-0 text-tc-brand" aria-hidden />
        <span>{post.readingTime}</span>
      </span>
      {post.tags.length > 0 ? (
        <span>{post.tags.join(' · ')}</span>
      ) : null}
    </div>
  );
}

export async function BlogArticleLayout({ post }: { post: CmsBlogPost }) {
  const path = getBlogPostPath(post.slug);
  const paragraphs = post.content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const publishedPosts = await getPublishedBlogPostsPublic();
  const related = buildRelatedContentForBlogPost(post, publishedPosts);

  const showDisclaimer = isTaxRelatedBlogPost(post);

  const jsonLd = [
    buildBlogPostBreadcrumbs(post.title, path),
    buildBlogPostingSchema({
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      path,
      publishedAt: post.publishedAt ?? post.updatedAt,
      modifiedAt: post.updatedAt,
      authorName: post.authorName ?? site.organization.name,
      imagePath: post.ogImage ?? undefined,
    }),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id={post.slug} />

      <Section spacing="xs" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.title },
            ]}
            className="mb-2"
          />
          <BlogHero post={post} />
          <BlogMetadataBar post={post} className="mt-3" />
        </PageContainer>
      </Section>

      <Section spacing="sm">
        <PageContainer width="page">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
            <article className="min-w-0 space-y-6">
              <div className="tc-prose">
                {paragraphs.map((paragraph) => (
                  <BlogContentParagraph key={paragraph.slice(0, 48)} text={paragraph} />
                ))}
              </div>

              <RelatedContentBlock
                title="Related content"
                description="Continue with calculators, guides, and related articles."
                variant="inline"
                calculators={related.calculators}
                resources={related.resources}
                articles={related.articles}
              />

              {showDisclaimer ? (
                <div className="space-y-2 border-t border-border/70 pt-4">
                  <p className="tc-caption">{site.disclaimer}</p>
                </div>
              ) : null}
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4 rounded-lg border border-border bg-card p-4 shadow-tc-sm">
                <h2 className="text-sm font-semibold text-foreground">In this article</h2>
                <p className="text-xs text-muted-foreground">
                  {post.category}
                  {post.taxYear ? ` · Tax year ${post.taxYear}` : ''}
                </p>
                <RelatedContentBlock
                  title="Keep exploring"
                  variant="compact"
                  calculators={related.calculators.slice(0, 4)}
                  resources={related.resources.slice(0, 3)}
                  articles={related.articles.slice(0, 3)}
                />
                <Link
                  href="/blog"
                  className="tc-focus-ring inline-block rounded-sm text-xs font-medium text-tc-link no-underline hover:underline"
                >
                  Browse all blog posts →
                </Link>
              </div>
            </aside>
          </div>
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
