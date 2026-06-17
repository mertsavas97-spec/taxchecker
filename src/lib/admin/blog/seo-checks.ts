import type { BlogPostInput } from '@/lib/admin/content/types';

export interface BlogEditorSeoCheck {
  id: string;
  label: string;
  passed: boolean;
}

const MIN_CONTENT_LENGTH = 120;

export function getBlogEditorSeoChecks(input: BlogPostInput): BlogEditorSeoCheck[] {
  return [
    {
      id: 'seo-title',
      label: 'SEO title',
      passed: input.seoTitle.trim().length > 0,
    },
    {
      id: 'seo-description',
      label: 'SEO description',
      passed: input.seoDescription.trim().length > 0,
    },
    {
      id: 'slug',
      label: 'Slug',
      passed: input.slug.trim().length > 0,
    },
    {
      id: 'content-length',
      label: 'Content length',
      passed: input.content.trim().length >= MIN_CONTENT_LENGTH,
    },
    {
      id: 'related-calculators',
      label: 'Related calculators',
      passed: input.relatedCalculators.length > 0,
    },
    {
      id: 'related-resources',
      label: 'Related resources',
      passed: input.relatedResources.length > 0,
    },
  ];
}

export function blogEditorSeoScore(input: BlogPostInput): number {
  const checks = getBlogEditorSeoChecks(input);
  const passed = checks.filter((check) => check.passed).length;
  return Math.round((passed / checks.length) * 100);
}
