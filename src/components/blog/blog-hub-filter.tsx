'use client';

import { useMemo, useState } from 'react';
import { SearchIcon } from 'lucide-react';

import { BlogCard, BlogFeaturedCard } from '@/components/blog/blog-card';
import { BlogEmptyState, BlogFilterEmptyState } from '@/components/blog/blog-empty-state';
import { Input } from '@/components/ui/input';
import { blogCategories, getBlogCategoryDefinition } from '@/config/blog-categories';
import type { CmsBlogPost } from '@/lib/admin/content/types';
import { cn } from '@/lib/utils';

function matchesQuery(post: CmsBlogPost, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [post.title, post.excerpt, post.category, ...post.tags]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
}

export function BlogHubFilter({
  posts,
  featuredPost,
}: {
  posts: CmsBlogPost[];
  featuredPost?: CmsBlogPost;
}) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const hasPublishedPosts = posts.length > 0 || Boolean(featuredPost);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === 'all' || post.category === activeCategory;
      return matchesCategory && matchesQuery(post, query);
    });
  }, [posts, query, activeCategory]);

  const activeCategoryMeta =
    activeCategory === 'all' ? null : getBlogCategoryDefinition(activeCategory);

  if (!hasPublishedPosts) {
    return <BlogEmptyState />;
  }

  return (
    <div className="space-y-4">
      {featuredPost ? <BlogFeaturedCard post={featuredPost} /> : null}

      {activeCategoryMeta ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {activeCategoryMeta.description}
        </p>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-2.5 shadow-tc-sm">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="blog-search" className="sr-only">
              Search blog posts
            </label>
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="blog-search"
              type="search"
              placeholder="Search by title or topic…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-8 border-border/80 bg-background pl-8 text-sm"
              autoComplete="off"
            />
          </div>

          <div
            className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Filter by category"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className={cn(
                'tc-focus-ring shrink-0 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors',
                activeCategory === 'all'
                  ? 'border-tc-brand/30 bg-tc-brand/10 text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted',
              )}
            >
              All
            </button>
            {blogCategories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'tc-focus-ring shrink-0 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors',
                  activeCategory === category
                    ? 'border-tc-brand/30 bg-tc-brand/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <BlogFilterEmptyState />
      )}
    </div>
  );
}
