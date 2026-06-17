import type { AdminContentStoreDriver } from '@/lib/admin/content/storage/types';

const storeLabels: Record<AdminContentStoreDriver, string> = {
  file: 'Local file store',
  memory: 'Memory store',
  supabase: 'Supabase CMS',
};

const storeHints: Record<AdminContentStoreDriver, string> = {
  file: 'Content saved to .data/content/',
  memory: 'In-process only — not persistent',
  supabase: 'Production Postgres backend',
};

export function AdminStoreBadge({
  driver,
  className,
}: {
  driver: AdminContentStoreDriver;
  className?: string;
}) {
  return (
    <span
      className={className}
      title={storeHints[driver]}
    >
      <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {storeLabels[driver]}
      </span>
    </span>
  );
}
