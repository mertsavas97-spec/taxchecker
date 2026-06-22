import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlogArticleLayout } from '@/components/blog/blog-article-layout';
import {
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts,
} from '@/lib/blog/public';
import { buildArticleMetadata } from '@/lib/seo/metadata';
import { resolveBlogImagePath } from '@/lib/blog/thumbnails';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return {
      robots: { index: false, follow: false },
    };
  }

  return buildArticleMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    slug: post.slug,
    path: post.canonicalUrl ?? `/blog/${post.slug}`,
    publishedAt: post.publishedAt ?? post.updatedAt,
    modifiedAt: post.updatedAt,
    authorName: post.authorName ?? undefined,
    ogImage: resolveBlogImagePath(post),
    keywords: post.tags,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogArticleLayout post={post} />;
}
