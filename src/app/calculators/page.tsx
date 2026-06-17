import type { Metadata } from 'next';
import { Suspense } from 'react';

import { CalculatorHubFilter } from '@/components/hub/calculator-hub-filter';
import { HubPageHeader } from '@/components/layout/hub-page-header';
import { PageContainer, Section } from '@/components/layout/page-container';
import { SiteShell } from '@/components/layout/site-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { getAllHubCalculators } from '@/config/calculator-hub';
import { buildCalculatorsHubMetadata } from '@/lib/seo/metadata';
import {
  buildCalculatorsCollectionSchema,
  buildCalculatorsHubBreadcrumbs,
} from '@/lib/seo/schema';

export function generateMetadata(): Metadata {
  return buildCalculatorsHubMetadata();
}

export default function CalculatorsHubPage() {
  const calculators = getAllHubCalculators();

  const jsonLd = [
    buildCalculatorsHubBreadcrumbs(),
    buildCalculatorsCollectionSchema(calculators),
  ];

  return (
    <SiteShell>
      <JsonLd data={jsonLd} id="calculators-hub" />

      <Section spacing="xs" className="border-b border-border bg-tc-slate-50/60">
        <PageContainer width="page">
          <HubPageHeader
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Calculators' },
            ]}
            eyebrow="Calculator hub"
            title="All Calculators"
            description="Browse free federal tax calculators for self-employment, quarterly payments, business structures, HSA savings, and employment comparisons. Each tool uses documented 2025 federal rules from IRS publications and runs locally in your browser."
          />
        </PageContainer>
      </Section>

      <Section spacing="sm">
        <PageContainer width="page">
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading calculators…</p>
            }
          >
            <CalculatorHubFilter />
          </Suspense>
        </PageContainer>
      </Section>
    </SiteShell>
  );
}
