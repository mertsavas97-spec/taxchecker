'use client';

import { AdminDataTable } from '@/components/admin/admin-data-table';
import { Badge } from '@/components/ui/badge';
import type { CmsSeoIssue } from '@/lib/admin/content/types';

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

export function SeoIssuesTable({ issues }: { issues: CmsSeoIssue[] }) {
  return (
    <AdminDataTable
      rows={issues}
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
  );
}
