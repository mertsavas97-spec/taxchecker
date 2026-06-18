import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  mapCmsBlogPostToDb,
  mapCmsCalculatorToDb,
  mapCmsResourceToDb,
  type DbCmsBlogPost,
  type DbCmsCalculatorMetadata,
  type DbCmsResource,
} from '@/lib/admin/content/storage/mappers';
import {
  seedCmsBlogPosts,
  seedCmsCalculators,
  seedCmsResources,
} from '@/lib/admin/content/seed';
import {
  planSeedRowAction,
  shouldUseRemotePublishedFallback,
} from '@/lib/admin/content/supabase-seed-policy';
import type { CmsBlogPost } from '@/lib/admin/content/types';

export type SeedSyncCounts = {
  inserted: number;
  updated: number;
  skipped: number;
};

export type SeedSyncResult = {
  calculators: SeedSyncCounts;
  resources: SeedSyncCounts;
  blogPosts: SeedSyncCounts;
  errors: string[];
};

export type SeedSyncOptions = {
  force?: boolean;
};

function isEditedBlogPost(existing: DbCmsBlogPost): boolean {
  return (existing.revision ?? 1) > 1;
}

function cmsDb(client: SupabaseClient): SupabaseClient<any> {
  return client as SupabaseClient<any>;
}

async function logSeedAudit(
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>,
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
    // Audit logging must not block seed operations.
  }
}

export async function syncSupabaseCmsSeed(
  options: SeedSyncOptions = {},
): Promise<SeedSyncResult> {
  const force = options.force === true;
  const supabase = cmsDb(createAdminClient());
  const result: SeedSyncResult = {
    calculators: { inserted: 0, updated: 0, skipped: 0 },
    resources: { inserted: 0, updated: 0, skipped: 0 },
    blogPosts: { inserted: 0, updated: 0, skipped: 0 },
    errors: [],
  };

  const [
    { data: existingResources, error: resourcesError },
    { data: existingBlogPosts, error: blogError },
    { data: existingCalculators, error: calculatorsError },
  ] = await Promise.all([
    supabase.from('cms_resources').select('slug'),
    supabase.from('cms_blog_posts').select('slug, revision'),
    supabase.from('cms_calculator_metadata').select('calculator_slug'),
  ]);

  if (resourcesError) result.errors.push(`resources: ${resourcesError.message}`);
  if (blogError) result.errors.push(`blog: ${blogError.message}`);
  if (calculatorsError) {
    result.errors.push(`calculators: ${calculatorsError.message}`);
  }

  const resourceBySlug = new Map(
    ((existingResources ?? []) as Pick<DbCmsResource, 'slug'>[]).map((row) => [
      row.slug,
      row,
    ]),
  );
  const blogBySlug = new Map(
    ((existingBlogPosts ?? []) as Pick<DbCmsBlogPost, 'slug' | 'revision'>[]).map(
      (row) => [row.slug, row],
    ),
  );
  const calculatorBySlug = new Set(
    ((existingCalculators ?? []) as Pick<DbCmsCalculatorMetadata, 'calculator_slug'>[]).map(
      (row) => row.calculator_slug,
    ),
  );

  for (const calculator of seedCmsCalculators()) {
    const exists = calculatorBySlug.has(calculator.slug);
    const action = planSeedRowAction(exists, { force, alwaysSyncRegistry: true });

    if (action === 'skip') {
      result.calculators.skipped += 1;
      continue;
    }

    const payload = mapCmsCalculatorToDb(calculator);
    const { error } = await supabase
      .from('cms_calculator_metadata')
      .upsert(payload, { onConflict: 'calculator_slug' });

    if (error) {
      result.errors.push(`calculator ${calculator.slug}: ${error.message}`);
      continue;
    }

    if (action === 'insert') {
      result.calculators.inserted += 1;
      await logSeedAudit('seed_insert', 'calculator', calculator.slug, { force });
    } else {
      result.calculators.updated += 1;
      await logSeedAudit('seed_update', 'calculator', calculator.slug, { force });
    }
  }

  for (const resource of seedCmsResources()) {
    const existing = resourceBySlug.get(resource.slug);
    const action = planSeedRowAction(Boolean(existing), { force });

    if (action === 'skip') {
      result.resources.skipped += 1;
      continue;
    }

    const payload = mapCmsResourceToDb(resource);
    const { error } = await supabase
      .from('cms_resources')
      .upsert(payload, { onConflict: 'slug' });

    if (error) {
      result.errors.push(`resource ${resource.slug}: ${error.message}`);
      continue;
    }

    if (action === 'insert') {
      result.resources.inserted += 1;
      await logSeedAudit('seed_insert', 'resource', resource.slug, { force });
    } else {
      result.resources.updated += 1;
      await logSeedAudit('seed_update', 'resource', resource.slug, { force });
    }
  }

  for (const post of seedCmsBlogPosts()) {
    const existing = blogBySlug.get(post.slug);
    const action = planSeedRowAction(Boolean(existing), {
      force,
      edited: existing ? isEditedBlogPost(existing as DbCmsBlogPost) : false,
    });

    if (action === 'skip') {
      result.blogPosts.skipped += 1;
      continue;
    }

    const payload = mapCmsBlogPostToDbForSeed(post);
    const { error } = await supabase
      .from('cms_blog_posts')
      .upsert(payload, { onConflict: 'slug' });

    if (error) {
      result.errors.push(`blog ${post.slug}: ${error.message}`);
      continue;
    }

    if (action === 'insert') {
      result.blogPosts.inserted += 1;
      await logSeedAudit('seed_insert', 'blog', post.slug, { force });
    } else {
      result.blogPosts.updated += 1;
      await logSeedAudit('seed_update', 'blog', post.slug, { force });
    }
  }

  console.info('[cms-seed] Supabase seed sync complete', {
    force,
    calculators: result.calculators,
    resources: result.resources,
    blogPosts: result.blogPosts,
    errorCount: result.errors.length,
  });

  return result;
}

/** Omits columns that are not present in the current Supabase schema. */
function mapCmsBlogPostToDbForSeed(post: CmsBlogPost) {
  const { related_blog_posts: _relatedBlogPosts, ...payload } =
    mapCmsBlogPostToDb(post) as ReturnType<typeof mapCmsBlogPostToDb> & {
      related_blog_posts?: string[];
    };
  return payload;
}

export type { SeedRowAction } from '@/lib/admin/content/supabase-seed-policy';
export { shouldUseRemotePublishedFallback } from '@/lib/admin/content/supabase-seed-policy';
