import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { SeoIssuesTable } from '@/components/admin/seo-issues-table';
import { SeedSyncPanel } from '@/components/admin/seed-sync-panel';
import { contentRegistry } from '@/lib/admin/content/registry';
import { getConfiguredStoreDriver, getStoreDriverLabel } from '@/lib/admin/content/storage';
import type { CmsSeoIssue } from '@/lib/admin/content/types';

function countIssues(
  issues: CmsSeoIssue[],
  key: keyof Pick<
    CmsSeoIssue,
    | 'missingSeoTitle'
    | 'missingSeoDescription'
    | 'missingLastReviewed'
    | 'missingRelatedContent'
    | 'missingTaxonomy'
  >,
): number {
  return issues.filter((issue) => issue[key]).length;
}

export default async function AdminSeoPage() {
  const issues = await contentRegistry.getSeoIssues();
  const withIssues = issues.filter(
    (issue) =>
      issue.missingSeoTitle ||
      issue.missingSeoDescription ||
      issue.missingLastReviewed ||
      issue.missingRelatedContent ||
      issue.missingTaxonomy,
  );

  return (
    <div>
      <AdminPageHeader
        title="SEO Audit"
        description="Internal audit dashboard for missing metadata across content types. No external integrations."
      />

      <SeedSyncPanel storeLabel={getStoreDriverLabel(getConfiguredStoreDriver())} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AdminStatCard
          label="Missing SEO title"
          value={countIssues(issues, 'missingSeoTitle')}
        />
        <AdminStatCard
          label="Missing SEO description"
          value={countIssues(issues, 'missingSeoDescription')}
        />
        <AdminStatCard
          label="Missing last reviewed"
          value={countIssues(issues, 'missingLastReviewed')}
        />
        <AdminStatCard
          label="Missing related content"
          value={countIssues(issues, 'missingRelatedContent')}
        />
        <AdminStatCard
          label="Missing taxonomy"
          value={countIssues(issues, 'missingTaxonomy')}
        />
      </div>

      <SeoIssuesTable issues={withIssues} />
    </div>
  );
}
