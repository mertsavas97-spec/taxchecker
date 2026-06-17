import 'server-only';

import { computeReadingTime } from '@/lib/blog/reading-time';
import { getContentStore } from '@/lib/admin/content/storage';
import type {
  BlogPostInput,
  CmsBlogPost,
  CmsCalculatorRecord,
  CmsContentStatus,
  CmsDashboardStats,
  CmsResource,
  CmsSeoIssue,
} from '@/lib/admin/content/types';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function createBlogPostRecord(input: BlogPostInput): CmsBlogPost {
  const now = todayIsoDate();
  const id = input.id ?? `blog-${input.slug}`;

  return {
    type: 'blog',
    id,
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    status: input.status,
    category: input.category,
    tags: input.tags,
    authorId: input.authorId ?? null,
    authorName: input.authorName ?? null,
    publishedAt: input.status === 'published' ? now : null,
    updatedAt: now,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    canonicalUrl: input.canonicalUrl ?? null,
    ogImage: input.ogImage ?? null,
    taxYear: input.taxYear ?? null,
    readingTime: computeReadingTime(input.content),
    featured: input.featured,
    relatedCalculators: input.relatedCalculators,
    relatedResources: input.relatedResources,
    relatedBlogPosts: input.relatedBlogPosts,
    revision: 1,
  };
}

class ContentRegistryStore {
  private get store() {
    return getContentStore();
  }

  async getResources(): Promise<CmsResource[]> {
    return this.store.getResources();
  }

  async getResourceById(id: string): Promise<CmsResource | undefined> {
    const resources = await this.getResources();
    return resources.find((resource) => resource.id === id);
  }

  async getBlogPosts(): Promise<CmsBlogPost[]> {
    return this.store.getBlogPosts();
  }

  async getBlogPostById(id: string): Promise<CmsBlogPost | undefined> {
    const posts = await this.getBlogPosts();
    return posts.find((post) => post.id === id);
  }

  async getBlogPostBySlug(slug: string): Promise<CmsBlogPost | undefined> {
    const posts = await this.getBlogPosts();
    return posts.find((post) => post.slug === slug);
  }

  async getCalculators(): Promise<CmsCalculatorRecord[]> {
    return this.store.getCalculators();
  }

  async saveResource(resource: CmsResource): Promise<CmsResource> {
    await this.store.saveResource(resource);
    return resource;
  }

  async saveBlogPost(post: CmsBlogPost): Promise<CmsBlogPost> {
    await this.store.saveBlogPost(post);
    return post;
  }

  async saveCalculatorMetadata(record: CmsCalculatorRecord): Promise<CmsCalculatorRecord> {
    await this.store.saveCalculatorMetadata(record);
    return record;
  }

  async updateResourceStatus(
    id: string,
    status: CmsContentStatus,
  ): Promise<CmsResource | null> {
    const existing = await this.getResourceById(id);
    if (!existing) return null;

    if (status === 'published') {
      await this.store.publishContent(id);
    } else if (status === 'archived') {
      await this.store.archiveContent(id);
    } else {
      await this.store.restoreContent(id);
    }

    return (await this.getResourceById(id)) ?? null;
  }

  async updateBlogPostStatus(
    id: string,
    status: CmsContentStatus,
  ): Promise<CmsBlogPost | null> {
    const existing = await this.getBlogPostById(id);
    if (!existing) return null;

    if (status === 'published') {
      await this.store.publishContent(id);
    } else if (status === 'archived') {
      await this.store.archiveContent(id);
    } else {
      await this.store.restoreContent(id);
    }

    return (await this.getBlogPostById(id)) ?? null;
  }

  async upsertBlogPost(input: BlogPostInput): Promise<CmsBlogPost> {
    const existing = input.id ? await this.getBlogPostById(input.id) : undefined;
    const now = todayIsoDate();

    const post: CmsBlogPost = {
      ...(existing ?? createBlogPostRecord(input)),
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      status: input.status,
      category: input.category,
      tags: input.tags,
      authorId: input.authorId ?? existing?.authorId ?? null,
      authorName: input.authorName ?? existing?.authorName ?? null,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      canonicalUrl: input.canonicalUrl ?? existing?.canonicalUrl ?? null,
      ogImage: input.ogImage ?? existing?.ogImage ?? null,
      taxYear: input.taxYear ?? existing?.taxYear ?? null,
      readingTime: computeReadingTime(input.content),
      featured: input.featured,
      relatedCalculators: input.relatedCalculators,
      relatedResources: input.relatedResources,
      relatedBlogPosts: input.relatedBlogPosts,
      updatedAt: now,
      publishedAt:
        input.status === 'published'
          ? (existing?.publishedAt ?? now)
          : input.status === 'draft'
            ? null
            : (existing?.publishedAt ?? null),
      revision: (existing?.revision ?? 0) + (existing ? 1 : 0),
    };

    await this.store.saveBlogPost(post);
    return post;
  }

  async createBlogPost(input: {
    title: string;
    slug: string;
    category: string;
  }): Promise<CmsBlogPost> {
    return this.upsertBlogPost({
      slug: input.slug,
      title: input.title,
      category: input.category,
      excerpt: '',
      content: '',
      status: 'draft',
      tags: [],
      seoTitle: '',
      seoDescription: '',
      featured: false,
      relatedCalculators: [],
      relatedResources: [],
      relatedBlogPosts: [],
    });
  }

  async getDashboardStats(): Promise<CmsDashboardStats> {
    const resources = await this.getResources();
    const blogPosts = await this.getBlogPosts();
    const calculators = await this.getCalculators();

    const allUpdates = [
      ...resources.map((item) => item.updatedAt),
      ...blogPosts.map((item) => item.updatedAt),
      ...calculators.map((item) => item.lastUpdated),
    ].sort();

    return {
      totalCalculators: calculators.filter((item) => item.published).length,
      publishedResources: resources.filter((item) => item.status === 'published')
        .length,
      draftResources: resources.filter((item) => item.status === 'draft').length,
      archivedResources: resources.filter((item) => item.status === 'archived')
        .length,
      publishedBlogPosts: blogPosts.filter((item) => item.status === 'published')
        .length,
      draftBlogPosts: blogPosts.filter((item) => item.status === 'draft').length,
      archivedBlogPosts: blogPosts.filter((item) => item.status === 'archived')
        .length,
      lastContentUpdate: allUpdates.at(-1) ?? null,
    };
  }

  async getRecentContent(limit = 8) {
    const combined = [
      ...(await this.getResources()).map((item) => ({
        id: item.id,
        type: 'resource' as const,
        title: item.title,
        status: item.status,
        updatedAt: item.updatedAt,
        href: `/admin/resources/${item.id}`,
      })),
      ...(await this.getBlogPosts()).map((item) => ({
        id: item.id,
        type: 'blog' as const,
        title: item.title,
        status: item.status,
        updatedAt: item.updatedAt,
        href: `/admin/blog/${item.id}`,
      })),
    ];

    return combined
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit);
  }

  async getSeoIssues(): Promise<CmsSeoIssue[]> {
    const issues: CmsSeoIssue[] = [];

    for (const resource of await this.getResources()) {
      issues.push({
        id: resource.id,
        contentType: 'resource',
        title: resource.title,
        slug: resource.slug,
        missingSeoTitle: !resource.seoTitle.trim(),
        missingSeoDescription: !resource.seoDescription.trim(),
        missingLastReviewed: !resource.updatedAt,
        missingRelatedContent:
          resource.relatedCalculatorSlugs.length === 0 ||
          resource.relatedResourceSlugs.length === 0,
        missingTaxonomy: !resource.category.trim(),
      });
    }

    for (const post of await this.getBlogPosts()) {
      issues.push({
        id: post.id,
        contentType: 'blog',
        title: post.title,
        slug: post.slug,
        missingSeoTitle: !post.seoTitle.trim(),
        missingSeoDescription: !post.seoDescription.trim(),
        missingLastReviewed: !post.updatedAt,
        missingRelatedContent:
          post.relatedCalculators.length === 0 ||
          post.relatedResources.length === 0,
        missingTaxonomy: !post.category.trim(),
      });
    }

    for (const calculator of await this.getCalculators()) {
      issues.push({
        id: calculator.id,
        contentType: 'calculator',
        title: calculator.name,
        slug: calculator.slug,
        missingSeoTitle: !calculator.seoTitle.trim(),
        missingSeoDescription: !calculator.seoDescription.trim(),
        missingLastReviewed: !calculator.lastReviewed,
        missingRelatedContent: false,
        missingTaxonomy: !calculator.category.trim(),
      });
    }

    return issues;
  }
}

const globalRegistry = globalThis as typeof globalThis & {
  __taxcheckerCmsRegistry?: ContentRegistryStore;
};

function getRegistry(): ContentRegistryStore {
  if (!globalRegistry.__taxcheckerCmsRegistry) {
    globalRegistry.__taxcheckerCmsRegistry = new ContentRegistryStore();
  }
  return globalRegistry.__taxcheckerCmsRegistry;
}

export const contentRegistry = {
  getResources: () => getRegistry().getResources(),
  getResourceById: (id: string) => getRegistry().getResourceById(id),
  getBlogPosts: () => getRegistry().getBlogPosts(),
  getBlogPostById: (id: string) => getRegistry().getBlogPostById(id),
  getBlogPostBySlug: (slug: string) => getRegistry().getBlogPostBySlug(slug),
  getCalculators: () => getRegistry().getCalculators(),
  saveResource: (resource: CmsResource) => getRegistry().saveResource(resource),
  saveBlogPost: (post: CmsBlogPost) => getRegistry().saveBlogPost(post),
  saveCalculatorMetadata: (record: CmsCalculatorRecord) =>
    getRegistry().saveCalculatorMetadata(record),
  updateResourceStatus: (id: string, status: CmsContentStatus) =>
    getRegistry().updateResourceStatus(id, status),
  updateBlogPostStatus: (id: string, status: CmsContentStatus) =>
    getRegistry().updateBlogPostStatus(id, status),
  upsertBlogPost: (input: BlogPostInput) => getRegistry().upsertBlogPost(input),
  createBlogPost: (input: { title: string; slug: string; category: string }) =>
    getRegistry().createBlogPost(input),
  getDashboardStats: () => getRegistry().getDashboardStats(),
  getRecentContent: (limit?: number) => getRegistry().getRecentContent(limit),
  getSeoIssues: () => getRegistry().getSeoIssues(),
};
