import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { getCalculatorBySlug } from '@/config/calculators';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  CmsBlogPost,
  CmsCalculatorRecord,
  CmsContentStatus,
  CmsResource,
} from '@/lib/admin/content/types';

import {
  isUuid,
  mapCmsBlogPostToDb,
  mapCmsCalculatorToDb,
  mapCmsResourceToDb,
  mapDbBlogPostToCms,
  mapDbCalculatorToCms,
  mapDbResourceToCms,
  type DbCmsBlogPost,
  type DbCmsCalculatorMetadata,
  type DbCmsResource,
} from './mappers';
import type { ContentStore } from './types';

function cmsDb(client: SupabaseClient): SupabaseClient<any> {
  return client as SupabaseClient<any>;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const supabase = cmsDb(createAdminClient());
    await supabase.from('cms_audit_log').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  } catch {
    // Audit logging must not block CMS operations.
  }
}

export class SupabaseContentStore implements ContentStore {
  private get client() {
    return cmsDb(createAdminClient());
  }

  async getResources(): Promise<CmsResource[]> {
    const { data, error } = await this.client
      .from('cms_resources')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return ((data ?? []) as DbCmsResource[]).map(mapDbResourceToCms);
  }

  async getBlogPosts(): Promise<CmsBlogPost[]> {
    const { data, error } = await this.client
      .from('cms_blog_posts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return ((data ?? []) as DbCmsBlogPost[]).map(mapDbBlogPostToCms);
  }

  async getCalculators(): Promise<CmsCalculatorRecord[]> {
    const { data, error } = await this.client
      .from('cms_calculator_metadata')
      .select('*')
      .order('title', { ascending: true });

    if (error) throw error;

    return ((data ?? []) as DbCmsCalculatorMetadata[]).map((row) => {
      const calculator = getCalculatorBySlug(row.calculator_slug);
      return mapDbCalculatorToCms(
        row,
        calculator?.route ?? `/calculators/${row.calculator_slug}`,
        calculator?.category ?? 'self-employed',
      );
    });
  }

  async saveResource(resource: CmsResource): Promise<void> {
    const payload = mapCmsResourceToDb(resource);
    const { error } = isUuid(resource.id)
      ? await this.client.from('cms_resources').update(payload).eq('id', resource.id)
      : await this.client.from('cms_resources').upsert(payload, { onConflict: 'slug' });

    if (error) throw error;
    await logAudit('save', 'resource', resource.id, { slug: resource.slug });
  }

  async saveBlogPost(post: CmsBlogPost): Promise<void> {
    const payload = mapCmsBlogPostToDb(post);
    const { error } = isUuid(post.id)
      ? await this.client.from('cms_blog_posts').update(payload).eq('id', post.id)
      : await this.client.from('cms_blog_posts').upsert(payload, { onConflict: 'slug' });

    if (error) throw error;
    await logAudit('save', 'blog', post.id, { slug: post.slug });
  }

  async saveCalculatorMetadata(record: CmsCalculatorRecord): Promise<void> {
    const payload = mapCmsCalculatorToDb(record);
    const { error } = isUuid(record.id)
      ? await this.client.from('cms_calculator_metadata').update(payload).eq('id', record.id)
      : await this.client
          .from('cms_calculator_metadata')
          .upsert(payload, { onConflict: 'calculator_slug' });
    if (error) throw error;
    await logAudit('save', 'calculator', record.id, { slug: record.slug });
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
    const now = new Date().toISOString();
    const publishedAt = status === 'published' ? now : null;
    const slugCandidate = id.startsWith('blog-') ? id.replace(/^blog-/, '') : id;

    for (const table of ['cms_resources', 'cms_blog_posts'] as const) {
      for (const [column, value] of [
        ['id', id],
        ['slug', slugCandidate],
      ] as const) {
        const { data, error } = await this.client
          .from(table)
          .update({
            status,
            published_at: publishedAt,
            updated_at: now,
          } as Record<string, unknown>)
          .eq(column, value)
          .select('id')
          .maybeSingle();

        if (error) throw error;
        if (data) {
          await logAudit(status, table, id);
          return;
        }
      }
    }

    throw new Error(`Content item not found: ${id}`);
  }
}
