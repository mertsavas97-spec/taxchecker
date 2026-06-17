import {
  seedCmsBlogPosts,
  seedCmsCalculators,
  seedCmsResources,
} from '@/lib/admin/content/seed';
import { mergeLaunchBlogPosts } from '@/lib/blog/launch-articles';
import type {
  CmsBlogPost,
  CmsCalculatorRecord,
  CmsContentStatus,
  CmsResource,
} from '@/lib/admin/content/types';

import type { ContentStore, ContentStoreData } from './types';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function resolveContentKind(
  id: string,
  data: ContentStoreData,
): 'resource' | 'blog' | null {
  if (data.blogPosts.some((post) => post.id === id)) return 'blog';
  if (data.resources.some((resource) => resource.id === id)) return 'resource';
  return id.startsWith('blog-') ? 'blog' : 'resource';
}

function applyStatusPatch<
  T extends { status: CmsContentStatus; publishedAt: string | null; updatedAt: string },
>(item: T, status: CmsContentStatus): T {
  const now = todayIsoDate();
  return {
    ...item,
    status,
    updatedAt: now,
    publishedAt:
      status === 'published'
        ? (item.publishedAt ?? now)
        : status === 'draft'
          ? null
          : item.publishedAt,
  };
}

export class MemoryContentStore implements ContentStore {
  private data: ContentStoreData;

  constructor(initial?: ContentStoreData) {
    this.data = initial ?? {
      resources: seedCmsResources(),
      blogPosts: mergeLaunchBlogPosts(seedCmsBlogPosts()),
      calculators: seedCmsCalculators(),
    };
  }

  async getResources(): Promise<CmsResource[]> {
    return [...this.data.resources].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }

  async getBlogPosts(): Promise<CmsBlogPost[]> {
    return [...this.data.blogPosts].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }

  async getCalculators(): Promise<CmsCalculatorRecord[]> {
    return [...this.data.calculators].sort((a, b) => a.name.localeCompare(b.name));
  }

  async saveResource(resource: CmsResource): Promise<void> {
    const index = this.data.resources.findIndex((item) => item.id === resource.id);
    if (index === -1) {
      this.data.resources.push(resource);
      return;
    }
    this.data.resources[index] = resource;
  }

  async saveBlogPost(post: CmsBlogPost): Promise<void> {
    const index = this.data.blogPosts.findIndex((item) => item.id === post.id);
    if (index === -1) {
      this.data.blogPosts.push(post);
      return;
    }
    this.data.blogPosts[index] = post;
  }

  async saveCalculatorMetadata(record: CmsCalculatorRecord): Promise<void> {
    const index = this.data.calculators.findIndex((item) => item.id === record.id);
    if (index === -1) {
      this.data.calculators.push(record);
      return;
    }
    this.data.calculators[index] = record;
  }

  async publishContent(id: string): Promise<void> {
    await this.updateStatus(id, 'published');
  }

  async archiveContent(id: string): Promise<void> {
    await this.updateStatus(id, 'archived');
  }

  async restoreContent(id: string): Promise<void> {
    await this.updateStatus(id, 'draft');
  }

  private async updateStatus(id: string, status: CmsContentStatus): Promise<void> {
    const kind = resolveContentKind(id, this.data);

    if (kind === 'blog') {
      const post = this.data.blogPosts.find((item) => item.id === id);
      if (!post) return;
      await this.saveBlogPost(applyStatusPatch(post, status));
      return;
    }

    const resource = this.data.resources.find((item) => item.id === id);
    if (!resource) return;
    await this.saveResource(applyStatusPatch(resource, status));
  }

  exportData(): ContentStoreData {
    return structuredClone(this.data);
  }

  importData(data: ContentStoreData): void {
    this.data = structuredClone(data);
  }
}
