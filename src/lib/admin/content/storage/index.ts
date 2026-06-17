import 'server-only';

/**
 * Content store factory.
 *
 * `ADMIN_CONTENT_STORE=supabase` — Supabase Postgres (production default when configured).
 * `ADMIN_CONTENT_STORE=file` — local JSON under `.data/content/` (dev default).
 * `ADMIN_CONTENT_STORE=memory` — in-process only.
 *
 * Production note: file store is dev/local only. Vercel deployments should set
 * `ADMIN_CONTENT_STORE=supabase` with Supabase env vars configured.
 */
import { isSupabaseAdminConfigured } from '@/lib/supabase/admin';

import { FileContentStore } from './file-store';
import { MemoryContentStore } from './memory-store';
import { SupabaseContentStore } from './supabase-store';
import type { AdminContentStoreDriver, ContentStore } from './types';

export type { ContentStore, ContentStoreData, ContentStoreKind, AdminContentStoreDriver } from './types';

export function getConfiguredStoreDriver(): AdminContentStoreDriver {
  const configured = process.env.ADMIN_CONTENT_STORE?.trim().toLowerCase();
  if (configured === 'supabase' || configured === 'file' || configured === 'memory') {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    return isSupabaseAdminConfigured() ? 'supabase' : 'memory';
  }

  return 'file';
}

export function getStoreDriverLabel(driver: AdminContentStoreDriver): string {
  switch (driver) {
    case 'supabase':
      return 'Supabase CMS';
    case 'file':
      return 'Local file store';
    default:
      return 'Memory store';
  }
}

export function isSupabaseStoreActive(): boolean {
  return getConfiguredStoreDriver() === 'supabase';
}

const globalStore = globalThis as typeof globalThis & {
  __taxcheckerContentStore?: ContentStore;
};

export function getContentStore(): ContentStore {
  if (!globalStore.__taxcheckerContentStore) {
    const driver = getConfiguredStoreDriver();
    globalStore.__taxcheckerContentStore =
      driver === 'supabase'
        ? new SupabaseContentStore()
        : driver === 'file'
          ? new FileContentStore()
          : new MemoryContentStore();
  }

  return globalStore.__taxcheckerContentStore;
}

export function resetContentStoreForTests(): void {
  delete globalStore.__taxcheckerContentStore;
}
