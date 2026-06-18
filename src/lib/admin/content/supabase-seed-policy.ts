export type SeedRowAction = 'insert' | 'update' | 'skip';

/** Pure helper for tests — decides whether a seed row should insert, update, or skip. */
export function planSeedRowAction(
  exists: boolean,
  options: { force?: boolean; edited?: boolean },
): SeedRowAction {
  if (!exists) return 'insert';
  if (options.force) return 'update';
  if (options.edited) return 'skip';
  return 'skip';
}

export function shouldUseRemotePublishedFallback<T>(
  remote: T[] | null,
): remote is T[] {
  return Array.isArray(remote) && remote.length > 0;
}
