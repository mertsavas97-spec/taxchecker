import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { contentRegistry } from '@/lib/admin/content/registry';

export default async function AdminResourceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await contentRegistry.getResourceById(id);

  if (!resource) {
    notFound();
  }

  return (
    <div>
      <AdminPageHeader
        title={resource.title}
        description="Registry metadata view. Full editor coming in a future sprint."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/resources">← Back to resources</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-tc-sm">
          <CardHeader>
            <CardTitle className="text-base">Content details</CardTitle>
            <CardDescription>Read-only registry fields</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <AdminStatusBadge status={resource.status} />
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Slug</span>
              <span className="font-mono text-xs">{resource.slug}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Route</span>
              <span className="font-mono text-xs">{resource.route}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Category</span>
              <span>{resource.category}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Tax year</span>
              <span>{resource.taxYear ?? '—'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Updated</span>
              <span>{resource.updatedAt}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-tc-sm">
          <CardHeader>
            <CardTitle className="text-base">SEO & relations</CardTitle>
            <CardDescription>Prepared for future editor integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">SEO title</p>
              <p>{resource.seoTitle || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">SEO description</p>
              <p>{resource.seoDescription || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Related calculators</p>
              <p className="font-mono text-xs">
                {resource.relatedCalculatorSlugs.join(', ') || '—'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Related resources</p>
              <p className="font-mono text-xs">
                {resource.relatedResourceSlugs.join(', ') || '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
