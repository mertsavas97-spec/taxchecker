import fs from 'node:fs';
import path from 'node:path';
import 'server-only';

import {
  seedCmsBlogPosts,
  seedCmsCalculators,
  seedCmsResources,
} from '@/lib/admin/content/seed';
import { mergeLaunchBlogPosts } from '@/lib/blog/launch-articles';
import type {
  CmsBlogPost,
  CmsCalculatorRecord,
  CmsResource,
} from '@/lib/admin/content/types';
import { normalizeBlogPost } from '@/lib/admin/content/normalize';

import { MemoryContentStore } from './memory-store';
import type { ContentStore, ContentStoreData } from './types';

const DATA_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  '.data',
  'content',
);
const FILES = {
  resources: path.join(DATA_DIR, 'resources.json'),
  blogPosts: path.join(DATA_DIR, 'blog-posts.json'),
  calculators: path.join(DATA_DIR, 'calculators.json'),
} as const;

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

function writeJsonFile(filePath: string, data: unknown): boolean {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    return true;
  } catch {
    return false;
  }
}

function seedData(): ContentStoreData {
  return {
    resources: seedCmsResources(),
    blogPosts: mergeLaunchBlogPosts(seedCmsBlogPosts()),
    calculators: seedCmsCalculators(),
  };
}

function loadOrSeedData(): { data: ContentStoreData; writable: boolean } {
  const hasAllFiles =
    fs.existsSync(FILES.resources) &&
    fs.existsSync(FILES.blogPosts) &&
    fs.existsSync(FILES.calculators);

  if (hasAllFiles) {
    return {
      data: {
        resources: readJsonFile<CmsResource[]>(FILES.resources) ?? seedCmsResources(),
        blogPosts: mergeLaunchBlogPosts(
          (readJsonFile<CmsBlogPost[]>(FILES.blogPosts) ?? seedCmsBlogPosts()).map(
            (post) => normalizeBlogPost(post),
          ),
        ),
        calculators:
          readJsonFile<CmsCalculatorRecord[]>(FILES.calculators) ??
          seedCmsCalculators(),
      },
      writable: true,
    };
  }

  const data = seedData();
  const writable =
    writeJsonFile(FILES.resources, data.resources) &&
    writeJsonFile(FILES.blogPosts, data.blogPosts) &&
    writeJsonFile(FILES.calculators, data.calculators);

  return { data, writable };
}

/** Local JSON persistence for development. Use Supabase in production. */
export class FileContentStore implements ContentStore {
  private readonly memory: MemoryContentStore;
  private readonly writable: boolean;

  constructor() {
    const { data, writable } = loadOrSeedData();
    this.memory = new MemoryContentStore(data);
    this.writable = writable;
  }

  private persist(): void {
    if (!this.writable) return;

    const data = this.memory.exportData();
    writeJsonFile(FILES.resources, data.resources);
    writeJsonFile(FILES.blogPosts, data.blogPosts);
    writeJsonFile(FILES.calculators, data.calculators);
  }

  async getResources(): Promise<CmsResource[]> {
    return this.memory.getResources();
  }

  async getBlogPosts(): Promise<CmsBlogPost[]> {
    return this.memory.getBlogPosts();
  }

  async getCalculators(): Promise<CmsCalculatorRecord[]> {
    return this.memory.getCalculators();
  }

  async saveResource(resource: CmsResource): Promise<void> {
    await this.memory.saveResource(resource);
    this.persist();
  }

  async saveBlogPost(post: CmsBlogPost): Promise<void> {
    await this.memory.saveBlogPost(post);
    this.persist();
  }

  async saveCalculatorMetadata(record: CmsCalculatorRecord): Promise<void> {
    await this.memory.saveCalculatorMetadata(record);
    this.persist();
  }

  async publishContent(id: string): Promise<void> {
    await this.memory.publishContent(id);
    this.persist();
  }

  async archiveContent(id: string): Promise<void> {
    await this.memory.archiveContent(id);
    this.persist();
  }

  async restoreContent(id: string): Promise<void> {
    await this.memory.restoreContent(id);
    this.persist();
  }
}
