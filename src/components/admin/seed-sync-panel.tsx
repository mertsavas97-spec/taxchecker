'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { syncSeedContentAction } from '@/lib/admin/content/actions';
import type { SeedSyncResult } from '@/lib/admin/content/supabase-seed';

function formatCounts(label: string, counts: SeedSyncResult['calculators']) {
  return `${label}: ${counts.inserted} inserted, ${counts.updated} updated, ${counts.skipped} skipped`;
}

function totalChanged(counts: SeedSyncResult['calculators']): number {
  return counts.inserted + counts.updated;
}

export function SeedSyncPanel({ storeLabel }: { storeLabel: string }) {
  const router = useRouter();
  const [result, setResult] = useState<SeedSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runSync(force: boolean) {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const syncResult = await syncSeedContentAction(force);
        setResult(syncResult);
        router.refresh();
      } catch (syncError) {
        setError(
          syncError instanceof Error
            ? syncError.message
            : 'Seed sync failed unexpectedly.',
        );
      }
    });
  }

  if (!storeLabel.toLowerCase().includes('supabase')) {
    return null;
  }

  const changedTotal = result
    ? totalChanged(result.calculators) +
      totalChanged(result.resources) +
      totalChanged(result.blogPosts)
    : 0;

  return (
    <div className="mb-6 rounded-lg border border-border bg-card p-4 shadow-tc-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Sync seed content
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Copy registry and launch content into Supabase. Normal sync inserts
            only missing rows. Force refresh overwrites seed-managed fields from
            source registries (edited blog posts with revision &gt; 1 are still
            skipped unless forced).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => runSync(false)}
          >
            {pending ? 'Syncing…' : 'Sync seed content'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => runSync(true)}
          >
            Force refresh
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-tc-liability" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          <p>{formatCounts('Calculators', result.calculators)}</p>
          <p>{formatCounts('Resources', result.resources)}</p>
          <p>{formatCounts('Blog posts', result.blogPosts)}</p>
          {result.errors.length > 0 ? (
            <p className="text-tc-liability" role="alert">
              {result.errors.length} error(s): {result.errors.join(' · ')}
            </p>
          ) : changedTotal > 0 ? (
            <p className="text-tc-savings">
              Seed sync completed — {changedTotal} row(s) inserted or updated.
              Dashboard counts should update above.
            </p>
          ) : (
            <p className="text-tc-savings">
              Seed sync completed — all seed rows already present (nothing to
              insert or update).
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
