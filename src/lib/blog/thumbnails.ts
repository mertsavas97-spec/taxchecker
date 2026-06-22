import type { CmsBlogPost } from '@/lib/admin/content/types';

export const DEFAULT_BLOG_THUMBNAIL = {
  path: '/images/blog/default-taxchecker-blog-hero.jpg',
  alt: 'Clean finance education desk with calculator and planning notebook',
} as const;

export interface BlogThumbnailDefinition {
  path: string;
  alt: string;
  category: string;
  prompt: string;
}

/**
 * Slug-based editorial hero images for launch and seed blog posts.
 * Full prompts and filenames: docs/blog-image-manifest.json
 */
export const BLOG_THUMBNAIL_BY_SLUG: Record<string, BlogThumbnailDefinition> = {
  'self-employment-tax-explained': {
    path: '/images/blog/self-employment-tax-explained-hero.jpg',
    alt: 'Freelancer desk with laptop, calculator, and tax planning notes for self-employment tax',
    category: 'Self Employment',
    prompt:
      'Editorial hero photograph of a freelancer desk with laptop, calculator, receipts, and tax planning notes, natural window light, premium finance publication style.',
  },
  'how-self-employment-tax-is-calculated': {
    path: '/images/blog/how-self-employment-tax-is-calculated-hero.jpg',
    alt: 'Hands using a calculator beside tax worksheets during self-employment tax calculation',
    category: 'Self Employment',
    prompt:
      'Editorial photograph of hands using a calculator beside blurred tax worksheets on a clean desk, bookkeeping context, natural daylight.',
  },
  'self-employment-tax-rate-2025': {
    path: '/images/blog/self-employment-tax-rate-2025-hero.jpg',
    alt: '2025 tax planning desk with calculator and organized financial documents',
    category: 'Self Employment',
    prompt:
      'Editorial photograph of a small business tax planning desk with calculator, calendar, and organized financial papers, warm natural light.',
  },
  '1099-vs-w2-explained': {
    path: '/images/blog/1099-vs-w2-explained-hero.jpg',
    alt: 'Contractor workspace with invoices contrasted with employee payroll paperwork',
    category: '1099 Contractors',
    prompt:
      'Editorial split desk photograph comparing contractor workspace with invoices and employee payroll paperwork, natural light, premium finance journalism.',
  },
  '1099-tax-deductions-explained': {
    path: '/images/blog/1099-tax-deductions-explained-hero.jpg',
    alt: 'Independent contractor desk with expense receipts, calculator, and income tracking',
    category: '1099 Contractors',
    prompt:
      'Editorial photograph of independent contractor desk with expense receipts, calculator, laptop, and invoice tracking, soft window light.',
  },
  'quarterly-taxes-explained': {
    path: '/images/blog/quarterly-taxes-explained-hero.jpg',
    alt: 'Tax planning desk with calendar, calculator, and quarterly estimated payment materials',
    category: 'Quarterly Taxes',
    prompt:
      'Editorial photograph of tax planning desk with calendar, calculator, checkbook, and quarterly payment planning materials, morning natural light.',
  },
  'estimated-tax-safe-harbor-rules': {
    path: '/images/blog/estimated-tax-safe-harbor-rules-hero.jpg',
    alt: 'Estimated tax planning desk with calculator, calendar, and payment worksheets',
    category: 'Quarterly Taxes',
    prompt:
      'Editorial photograph of estimated tax planning desk with calculator, planner calendar, blurred payment vouchers, natural daylight.',
  },
  'llc-vs-s-corp-explained': {
    path: '/images/blog/llc-vs-s-corp-explained-hero.jpg',
    alt: 'Business formation paperwork on a desk for LLC versus S corporation planning',
    category: 'Business Structures',
    prompt:
      'Editorial photograph of entrepreneur desk with two stacks of incorporation paperwork, laptop, reading glasses, business formation planning scene.',
  },
  'reasonable-salary-explained': {
    path: '/images/blog/reasonable-salary-explained-hero.jpg',
    alt: 'S corporation payroll planning desk with calculator and business checkbook',
    category: 'Business Structures',
    prompt:
      'Editorial photograph of S corporation payroll planning desk with calculator, checkbook, blurred payroll summary, professional home office.',
  },
  'federal-tax-brackets-2025-explained': {
    path: '/images/blog/federal-tax-brackets-2025-explained-hero.jpg',
    alt: 'Tax planning desk with financial documents and calculator for 2025 bracket planning',
    category: 'Tax Planning',
    prompt:
      'Editorial photograph of long-term tax planning desk with financial documents, calculator, reading glasses, warm natural lighting.',
  },
};

export function getBlogThumbnailPathForSlug(slug: string): string {
  return BLOG_THUMBNAIL_BY_SLUG[slug]?.path ?? DEFAULT_BLOG_THUMBNAIL.path;
}

export function resolveBlogImagePath(
  post: Pick<CmsBlogPost, 'ogImage' | 'slug'>,
): string {
  const cmsPath = post.ogImage?.trim();
  if (cmsPath && !cmsPath.endsWith('.svg')) {
    if (cmsPath.startsWith('http://') || cmsPath.startsWith('https://')) {
      return cmsPath;
    }
    if (cmsPath.startsWith('public/')) {
      return `/${cmsPath.slice('public/'.length)}`;
    }
    if (cmsPath.startsWith('/public/')) {
      return cmsPath.replace('/public/', '/');
    }
    if (cmsPath.startsWith('/')) {
      return cmsPath;
    }
    return `/images/blog/${cmsPath}`;
  }

  return getBlogThumbnailPathForSlug(post.slug);
}

export function resolveBlogImageAlt(
  post: Pick<CmsBlogPost, 'title' | 'slug' | 'category'>,
): string {
  return BLOG_THUMBNAIL_BY_SLUG[post.slug]?.alt ?? `${post.title} — TaxChecker blog`;
}

export function getBlogThumbnail(post: Pick<CmsBlogPost, 'ogImage' | 'slug' | 'title' | 'category'>) {
  return {
    src: resolveBlogImagePath(post),
    alt: resolveBlogImageAlt(post),
  };
}
