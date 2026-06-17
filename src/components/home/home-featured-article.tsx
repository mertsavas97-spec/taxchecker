import Link from 'next/link';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';

import { BlogFeaturedCard } from '@/components/blog/blog-card';
import { getBlogCategoryDefinition } from '@/config/blog-categories';
import type { CmsBlogPost } from '@/lib/admin/content/types';
import { getBlogPostPath } from '@/lib/blog/paths';

export function HomeFeaturedArticle({ post }: { post: CmsBlogPost }) {
  const category = getBlogCategoryDefinition(post.category);

  return (
    <section className="rounded-xl border border-tc-brand/20 bg-gradient-to-br from-tc-brand/5 to-card p-5 shadow-tc-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="tc-reading-width space-y-2">
          <p className="tc-overline text-tc-brand">Featured article</p>
          <h2 className="tc-heading-subsection text-foreground">{post.title}</h2>
          <p className="text-base leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5 shrink-0" aria-hidden />
            {post.readingTime}
            {post.publishedAt ? ` · ${post.publishedAt}` : null}
            {category ? ` · ${category.label}` : null}
          </p>
        </div>
        <Link
          href={getBlogPostPath(post.slug)}
          className="tc-focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-md text-sm font-semibold text-tc-link no-underline hover:underline"
        >
          Read article
          <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}