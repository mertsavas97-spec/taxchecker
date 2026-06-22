import Link from 'next/link';

import { BLOG_HUB_PAGE_SIZE, shouldShowBlogHubPagination } from '@/lib/blog/pagination';
import { cn } from '@/lib/utils';

export function BlogPagination({
  currentPage,
  totalPages,
  totalPosts,
  basePath = '/blog',
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  basePath?: string;
  /** When set, use buttons for client-side pagination (e.g. active filters). */
  onPageChange?: (page: number) => void;
}) {
  if (!shouldShowBlogHubPagination(totalPosts, BLOG_HUB_PAGE_SIZE)) {
    return null;
  }

  const linkMode = !onPageChange;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  function pageHref(page: number): string {
    if (page <= 1) return basePath;
    return `${basePath}?page=${page}`;
  }

  return (
    <nav
      aria-label="Blog pagination"
      className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-border/70 pt-6"
    >
      {linkMode ? (
        currentPage > 1 ? (
          <Link
            href={pageHref(currentPage - 1)}
            className="tc-focus-ring rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground no-underline hover:bg-muted"
          >
            Previous
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-muted-foreground"
          >
            Previous
          </span>
        )
      ) : (
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="tc-focus-ring rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {pages.map((page) =>
          linkMode ? (
            <Link
              key={page}
              href={pageHref(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                'tc-focus-ring rounded-md border px-3 py-1.5 text-sm font-medium no-underline',
                page === currentPage
                  ? 'border-tc-brand/30 bg-tc-brand/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted',
              )}
            >
              Page {page}
            </Link>
          ) : (
            <button
              key={page}
              type="button"
              aria-current={page === currentPage ? 'page' : undefined}
              onClick={() => onPageChange?.(page)}
              className={cn(
                'tc-focus-ring rounded-md border px-3 py-1.5 text-sm font-medium',
                page === currentPage
                  ? 'border-tc-brand/30 bg-tc-brand/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted',
              )}
            >
              Page {page}
            </button>
          ),
        )}
      </div>

      {linkMode ? (
        currentPage < totalPages ? (
          <Link
            href={pageHref(currentPage + 1)}
            className="tc-focus-ring rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground no-underline hover:bg-muted"
          >
            Next
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-muted-foreground"
          >
            Next
          </span>
        )
      ) : (
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="tc-focus-ring rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      )}
    </nav>
  );
}
