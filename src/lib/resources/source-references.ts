import type { SourceReferenceItem } from '@/components/calculator/source-section';
import { getPublicSourceRegistry } from '@/lib/authority/source-registry';

export function resolveSourceReferences(sourceIds: string[]): SourceReferenceItem[] {
  if (sourceIds.length === 0) return [];

  const registry = getPublicSourceRegistry();
  const byId = new Map(registry.map((entry) => [entry.id, entry]));

  return sourceIds
    .map((id) => byId.get(id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .map((entry) => ({
      title: entry.title,
      url: entry.url,
      taxYear: entry.taxYear,
      dateAccessed: entry.dateAccessed,
      note: entry.usedFor,
    }));
}
