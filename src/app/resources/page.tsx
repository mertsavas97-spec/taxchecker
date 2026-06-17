import type { Metadata } from 'next';

import { ResourceHubFilter } from '@/components/hub/resource-hub-filter';
import { HubPageHeader } from '@/components/layout/hub-page-header';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getHubResourcesPublic,
  getPublishedResourcesPublic,
} from '@/lib/cms/public-read';
import { buildResourcesHubMetadata } from '@/lib/seo/metadata';
import {
  buildResourcesCollectionSchema,
  buildResourcesHubBreadcrumbs,
} from '@/lib/seo/schema';

export function generateMetadata(): Metadata {
  return buildResourcesHubMetadata();
}

export default async function ResourcesHubPage() {
  const resources = await getHubResourcesPublic();
  const publishedResources = await getPublishedResourcesPublic();

  const jsonLd = [
    buildResourcesHubBreadcrumbs(),
    buildResourcesCollectionSchema(resources, publishedResources),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="resources-hub" />

      <Section spacing="xs" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <HubPageHeader
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Resources' },
            ]}
            eyebrow="Resource hub"
            title="All Resources"
            description="Guides, quarterly deadlines, tax bracket references, and methodology articles maintained and reviewed regularly. Each resource cites IRS publications and the current federal tax year where applicable."
          />
        </PageContainer>
      </Section>

      <Section spacing="sm">
        <PageContainer width="page">
          <ResourceHubFilter resources={resources} />
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
