import type { ResourceInput } from '@/lib/admin/content/types';

export interface ResourceEditorSeoCheck {
  id: string;
  label: string;
  passed: boolean;
}

export function getResourceEditorSeoChecks(input: ResourceInput): ResourceEditorSeoCheck[] {
  const annualCategory =
    input.category.toLowerCase().includes('bracket') ||
    input.category.toLowerCase().includes('deadline') ||
    input.taxYear !== null;

  return [
    { id: 'seoTitle', label: 'SEO title present', passed: input.seoTitle.trim().length > 0 },
    {
      id: 'seoDescription',
      label: 'SEO description present',
      passed: input.seoDescription.trim().length >= 50,
    },
    { id: 'slug', label: 'Slug present', passed: input.slug.trim().length > 0 },
    {
      id: 'content',
      label: 'Content length OK (≥120 chars)',
      passed: input.content.trim().length >= 120,
    },
    { id: 'category', label: 'Category present', passed: input.category.trim().length > 0 },
    {
      id: 'taxYear',
      label: 'Tax year present for annual resource',
      passed: !annualCategory || input.taxYear !== null,
    },
    {
      id: 'lastReviewed',
      label: 'Last reviewed date present',
      passed: Boolean(input.lastReviewed?.trim()),
    },
    {
      id: 'relatedCalculators',
      label: 'Related calculators linked',
      passed: input.relatedCalculatorSlugs.length > 0,
    },
    {
      id: 'relatedResources',
      label: 'Related resources linked',
      passed: input.relatedResourceSlugs.length > 0,
    },
    {
      id: 'sourceIds',
      label: 'Source IDs present',
      passed: input.sourceIds.length > 0,
    },
  ];
}

export function resourceEditorSeoScore(input: ResourceInput): number {
  const checks = getResourceEditorSeoChecks(input);
  const passed = checks.filter((check) => check.passed).length;
  return Math.round((passed / checks.length) * 100);
}
