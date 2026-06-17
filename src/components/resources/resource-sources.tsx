import { IrsSourceBlock } from '@/components/content/irs-source-block';
import type { SourceReferenceItem } from '@/components/calculator/source-section';
import {
  IRS_SOURCES_DESCRIPTION,
  IRS_SOURCES_TITLE,
} from '@/config/related-content';

export function ResourceSources({
  sources,
  notice,
}: {
  sources: SourceReferenceItem[];
  notice?: string;
}) {
  return (
    <IrsSourceBlock
      title={IRS_SOURCES_TITLE}
      description={IRS_SOURCES_DESCRIPTION}
      sources={sources}
      notice={notice}
    />
  );
}
