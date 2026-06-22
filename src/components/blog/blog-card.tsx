import Link from 'next/link';
import { ArrowRightIcon, ClockIcon, StarIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { CmsBlogPost } from '@/lib/admin/content/types';
import { getBlogPostPath } from '@/lib/blog/paths';
import { cn } from '@/lib/utils';

export function BlogCard({
  post,
  className,
  featured = false,
}: {
  post: CmsBlogPost;
  className?: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={getBlogPostPath(post.slug)}
      className={cn('group block h-full rounded-lg no-underline tc-focus-ring', className)}
    >
      <Card
        size="sm"
        className={cn(
          'flex h-full flex-col border-border bg-card py-0 shadow-tc-sm transition-all group-hover:border-tc-brand/30 group-hover:shadow-tc-md',
          featured && 'border-tc-brand/25 bg-tc-brand/5',
        )}
      >
        <CardHeader className="gap-2 border-b border-border/60 bg-muted/20 pb-3">
          <div className="flex items-center justify-between gap-2">
            <p className="tc-overline text-tc-brand">{post.category}</p>
            {featured ? (
              <Badge
                variant="outline"
                className="border-tc-brand/30 bg-tc-brand/10 text-[10px] font-semibold uppercase tracking-wide text-tc-brand"
              >
                <StarIcon className="mr-1 size-3" aria-hidden />
                Featured
              </Badge>
            ) : null}
          </div>
          <CardTitle className="text-base leading-snug font-semibold tracking-tight text-foreground group-hover:text-tc-link">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 pt-3">
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ClockIcon className="size-3 shrink-0" aria-hidden />
            {post.readingTime}
            {post.publishedAt ? ` · ${post.publishedAt}` : null}
          </p>
        </CardContent>
        <CardFooter className="border-t border-border/60 pt-3 pb-3">
          <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-tc-brand/20 bg-tc-brand/5 px-3 py-2 text-xs font-semibold text-tc-link transition-colors group-hover:border-tc-brand/35 group-hover:bg-tc-brand/10">
            Read article
            <ArrowRightIcon
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function BlogFeaturedCard({ post }: { post: CmsBlogPost }) {
  return (
    <section className="rounded-xl border border-tc-brand/20 bg-tc-brand/5 p-5 shadow-tc-sm md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="tc-reading-width space-y-2">
          <p className="tc-overline text-tc-brand">Featured</p>
          <h2 className="tc-heading-subsection text-foreground">{post.title}</h2>
          <p className="text-base leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="size-3 shrink-0" aria-hidden />
            {post.readingTime}
            {post.publishedAt ? ` · ${post.publishedAt}` : null}
          </p>
        </div>
        <Link
          href={getBlogPostPath(post.slug)}
          className="tc-focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-md text-sm font-semibold text-tc-link no-underline hover:underline"
        >
          Read featured article
          <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
