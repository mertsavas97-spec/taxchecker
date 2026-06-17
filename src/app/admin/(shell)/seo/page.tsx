import { AdminDataTable } from '@/components/admin/admin-data-table';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { Badge } from '@/components/ui/badge';
import { contentRegistry } from '@/lib/admin/content/registry';
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

function IssueFlags({ issue }: { issue: CmsSeoIssue }) {
  const flags = [
    issue.missingSeoTitle && 'SEO title',
    issue.missingSeoDescription && 'SEO description',
    issue.missingLastReviewed && 'Last reviewed',
    issue.missingRelatedContent && 'Related content',
    issue.missingTaxonomy && 'Taxonomy',
  ].filter(Boolean) as string[];

  if (flags.length === 0) {
    return (
      <Badge
        variant="outline"
        className="border-tc-savings/30 bg-tc-savings-muted/50 text-tc-savings text-[10px]"
      >
        Complete
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((flag) => (
        <Badge
          key={flag}
          variant="outline"
          className="border-tc-liability/20 bg-tc-liability-muted/40 text-tc-liability text-[10px]"
        >
          {flag}
        </Badge>
      ))}
    </div>
  );
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

      <AdminDataTable
        rows={withIssues}
        emptyTitle="No SEO issues found"
        emptyDescription="All tracked content has complete metadata."
        columns={[
          {
            key: 'title',
            header: 'Content',
            render: (row) => (
              <div>
                <p className="font-medium">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.slug}</p>
              </div>
            ),
          },
          {
            key: 'type',
            header: 'Type',
            render: (row) => (
              <span className="capitalize text-muted-foreground">
                {row.contentType}
              </span>
            ),
          },
          {
            key: 'issues',
            header: 'Issues',
            render: (row) => <IssueFlags issue={row} />,
          },
        ]}
      />
    </div>
  );
}
