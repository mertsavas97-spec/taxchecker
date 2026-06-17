import { AdminDataTable } from '@/components/admin/admin-data-table';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminPublishedBadge } from '@/components/admin/admin-status-badge';
import { Badge } from '@/components/ui/badge';
import { contentRegistry } from '@/lib/admin/content/registry';

export default async function AdminCalculatorsPage() {
  const calculators = await contentRegistry.getCalculators();

  return (
    <div>
      <AdminPageHeader
        title="Calculators"
        description="Calculator metadata registry for annual tax-year reviews. Does not modify calculator logic."
      />

      <AdminDataTable
        rows={calculators}
        emptyTitle="No calculators in registry"
        columns={[
          {
            key: 'name',
            header: 'Calculator Name',
            render: (row) => (
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.slug}</p>
              </div>
            ),
          },
          {
            key: 'slug',
            header: 'Slug',
            render: (row) => (
              <span className="font-mono text-xs text-muted-foreground">
                {row.slug}
              </span>
            ),
          },
          {
            key: 'taxYear',
            header: 'Tax Year',
            render: (row) => row.taxYear,
          },
          {
            key: 'lastReviewed',
            header: 'Last Reviewed',
            render: (row) => (
              <span className="text-muted-foreground">{row.lastReviewed}</span>
            ),
          },
          {
            key: 'featured',
            header: 'Featured Badge',
            render: (row) =>
              row.featuredBadge ? (
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {row.featuredBadge}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          {
            key: 'published',
            header: 'Published',
            render: (row) => <AdminPublishedBadge published={row.published} />,
          },
        ]}
      />
    </div>
  );
}
