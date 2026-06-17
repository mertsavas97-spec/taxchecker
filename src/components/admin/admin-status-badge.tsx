import type { CmsContentStatus } from '@/lib/admin/content/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<CmsContentStatus, string> = {
  draft: 'border-border bg-muted text-muted-foreground',
  published: 'border-tc-savings/30 bg-tc-savings-muted/50 text-tc-savings',
  archived: 'border-tc-liability/20 bg-tc-liability-muted/40 text-tc-liability',
};

const statusLabels: Record<CmsContentStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

export function AdminStatusBadge({
  status,
  className,
}: {
  status: CmsContentStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-semibold uppercase tracking-wide',
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </Badge>
  );
}

export function AdminPublishedBadge({
  published,
  className,
}: {
  published: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-semibold uppercase tracking-wide',
        published
          ? statusStyles.published
          : 'border-border bg-muted text-muted-foreground',
        className,
      )}
    >
      {published ? 'Published' : 'Unpublished'}
    </Badge>
  );
}
