import type {
  CmsBlogPost,
  CmsCalculatorRecord,
  CmsResource,
} from '@/lib/admin/content/types';

export type ContentStoreKind = 'resource' | 'blog';

export type AdminContentStoreDriver = 'supabase' | 'file' | 'memory';

export interface ContentStoreData {
  resources: CmsResource[];
  blogPosts: CmsBlogPost[];
  calculators: CmsCalculatorRecord[];
}

export interface ContentStore {
  getResources(): Promise<CmsResource[]>;
  getBlogPosts(): Promise<CmsBlogPost[]>;
  getCalculators(): Promise<CmsCalculatorRecord[]>;
  saveResource(resource: CmsResource): Promise<void>;
  saveBlogPost(post: CmsBlogPost): Promise<void>;
  saveCalculatorMetadata(record: CmsCalculatorRecord): Promise<void>;
  publishContent(id: string): Promise<void>;
  archiveContent(id: string): Promise<void>;
  restoreContent(id: string): Promise<void>;
}
