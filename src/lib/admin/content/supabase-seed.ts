import 'server-only';

import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import {
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
  mapCmsBlogPostToDbForSeed,
  mapCmsCalculatorToDbForSeed,
  mapCmsResourceToDbForSeed,
} from '@/lib/admin/content/supabase-seed-mappers';
import {
  planSeedRowAction,
  type SeedRowAction,
} from '@/lib/admin/content/supabase-seed-policy';

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

function cmsDb(client: SupabaseClient): SupabaseClient<any> {
  return client as SupabaseClient<any>;
}

function isEditedBlogPost(existing: Pick<DbCmsBlogPost, 'revision'>): boolean {
  return (existing.revision ?? 1) > 1;
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

async function writeSeedRow(
  supabase: SupabaseClient<any>,
  table: string,
  conflictColumn: string,
  conflictValue: string,
  payload: Record<string, unknown>,
  action: SeedRowAction,
): Promise<PostgrestError | null> {
  if (action === 'skip') return null;

  if (action === 'insert') {
    const { error } = await supabase.from(table).insert(payload);
    return error;
  }

  const { error } = await supabase
    .from(table)
    .update(payload)
    .eq(conflictColumn, conflictValue);

  return error;
}

function recordSeedCount(
  counts: SeedSyncCounts,
  action: SeedRowAction,
): void {
  if (action === 'insert') counts.inserted += 1;
  else if (action === 'update') counts.updated += 1;
  else counts.skipped += 1;
}

export async function syncSupabaseCmsSeed(
  options: SeedSyncOptions = {},
): Promise<SeedSyncResult> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error(
      'Supabase admin credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in production.',
    );
  }

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

  if (resourcesError) result.errors.push(`resources lookup: ${resourcesError.message}`);
  if (blogError) result.errors.push(`blog lookup: ${blogError.message}`);
  if (calculatorsError) {
    result.errors.push(`calculators lookup: ${calculatorsError.message}`);
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
    const action = planSeedRowAction(exists, { force });
    recordSeedCount(result.calculators, action);

    if (action === 'skip') continue;

    const payload = mapCmsCalculatorToDbForSeed(calculator);
    const error = await writeSeedRow(
      supabase,
      'cms_calculator_metadata',
      'calculator_slug',
      calculator.slug,
      payload,
      action,
    );

    if (error) {
      result.calculators[action === 'insert' ? 'inserted' : 'updated'] -= 1;
      result.errors.push(`calculator ${calculator.slug}: ${error.message}`);
      continue;
    }

    await logSeedAudit(
      action === 'insert' ? 'seed_insert' : 'seed_update',
      'calculator',
      calculator.slug,
      { force },
    );
  }

  for (const resource of seedCmsResources()) {
    const existing = resourceBySlug.get(resource.slug);
    const action = planSeedRowAction(Boolean(existing), { force });
    recordSeedCount(result.resources, action);

    if (action === 'skip') continue;

    const payload = mapCmsResourceToDbForSeed(resource);
    const error = await writeSeedRow(
      supabase,
      'cms_resources',
      'slug',
      resource.slug,
      payload,
      action,
    );

    if (error) {
      result.resources[action === 'insert' ? 'inserted' : 'updated'] -= 1;
      result.errors.push(`resource ${resource.slug}: ${error.message}`);
      continue;
    }

    await logSeedAudit(
      action === 'insert' ? 'seed_insert' : 'seed_update',
      'resource',
      resource.slug,
      { force },
    );
  }

  for (const post of seedCmsBlogPosts()) {
    const existing = blogBySlug.get(post.slug);
    const action = planSeedRowAction(Boolean(existing), {
      force,
      edited: existing ? isEditedBlogPost(existing) : false,
    });
    recordSeedCount(result.blogPosts, action);

    if (action === 'skip') continue;

    const payload = mapCmsBlogPostToDbForSeed(post);
    const error = await writeSeedRow(
      supabase,
      'cms_blog_posts',
      'slug',
      post.slug,
      payload,
      action,
    );

    if (error) {
      result.blogPosts[action === 'insert' ? 'inserted' : 'updated'] -= 1;
      result.errors.push(`blog ${post.slug}: ${error.message}`);
      continue;
    }

    await logSeedAudit(
      action === 'insert' ? 'seed_insert' : 'seed_update',
      'blog',
      post.slug,
      { force },
    );
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

export type { SeedRowAction } from '@/lib/admin/content/supabase-seed-policy';
export { shouldUseRemotePublishedFallback } from '@/lib/admin/content/supabase-seed-policy';
