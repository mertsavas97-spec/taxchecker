export {
  absoluteUrl,
  canonicalUrl,
  calculatorUrl,
  resourceUrl,
  blogUrl,
  ogImageUrl,
} from './urls';

export {
  buildDefaultMetadata,
  buildCalculatorMetadata,
  buildResourceMetadata,
  buildArticleMetadata,
  buildHomeMetadata,
  buildCalculatorsHubMetadata,
  buildStaticPageMetadata,
  type MetadataOptions,
  type ArticleMetadataInput,
} from './metadata';

export { ogPaths } from '@/lib/og/paths';
export {
  auditOgMetadataCoverage,
  summarizeOgMetadataCoverage,
  type OgCoverageEntry,
} from '@/lib/og/metadata-audit';

export {
  collectMetadataAuditEntries,
  findDuplicateDescriptions,
  findDuplicateTitles,
  summarizeMetadataAudit,
  type MetadataAuditEntry,
} from './metadata-audit';

export * from './schema';
