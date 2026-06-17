/** CMS lifecycle status — distinct from public site `published | coming_soon`. */
export type CmsContentStatus = 'draft' | 'published' | 'archived';

export type CmsContentType = 'resource' | 'blog';

export interface CmsContentBase {
  id: string;
  slug: string;
  title: string;
  status: CmsContentStatus;
  publishedAt: string | null;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
  taxYear: number | null;
  category: string;
}

export interface CmsResource extends CmsContentBase {
  type: 'resource';
  route: string;
  shortTitle: string;
  featured: boolean;
  relatedCalculatorSlugs: string[];
  relatedResourceSlugs: string[];
  relatedBlogSlugs?: string[];
  /** Optional body copy when stored in Supabase */
  content?: string;
  description?: string;
  readingTime?: string;
  lastReviewed?: string | null;
  sourceIds?: string[];
}

export interface CmsBlogPost extends CmsContentBase {
  type: 'blog';
  excerpt: string;
  content: string;
  tags: string[];
  authorId: string | null;
  authorName: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  readingTime: string;
  featured: boolean;
  relatedCalculators: string[];
  relatedResources: string[];
  relatedBlogPosts: string[];
  /** Reserved for future revision history */
  revision: number;
}

export type CmsContentItem = CmsResource | CmsBlogPost;

export interface CmsCalculatorRecord {
  id: string;
  slug: string;
  name: string;
  route: string;
  taxYear: number;
  lastReviewed: string;
  lastUpdated: string;
  featuredBadge: string | null;
  published: boolean;
  category: string;
  seoTitle: string;
  seoDescription: string;
}

export interface CmsDashboardStats {
  totalCalculators: number;
  publishedResources: number;
  draftResources: number;
  archivedResources: number;
  publishedBlogPosts: number;
  draftBlogPosts: number;
  archivedBlogPosts: number;
  lastContentUpdate: string | null;
}

export interface CmsSeoIssue {
  id: string;
  contentType: CmsContentType | 'calculator';
  title: string;
  slug: string;
  missingSeoTitle: boolean;
  missingSeoDescription: boolean;
  missingLastReviewed: boolean;
  missingRelatedContent: boolean;
  missingTaxonomy: boolean;
}

export interface BlogPostInput {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: CmsContentStatus;
  category: string;
  tags: string[];
  authorId?: string | null;
  authorName?: string | null;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  featured: boolean;
  relatedCalculators: string[];
  relatedResources: string[];
  relatedBlogPosts: string[];
  taxYear?: number | null;
}

export interface ContentRegistryOverrides {
  resources: Record<string, Partial<CmsResource>>;
  blogPosts: Record<string, Partial<CmsBlogPost>>;
}
