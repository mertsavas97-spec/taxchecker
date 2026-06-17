import { RelatedGuidesBlock } from '@/components/content/related-guides-block';
import {
  RELATED_RESOURCES_DESCRIPTION,
  RELATED_RESOURCES_TITLE,
} from '@/config/related-content';
import type { GuideLink } from '@/lib/calculators/related-links';

export function RelatedResources({
  resources,
  title = RELATED_RESOURCES_TITLE,
  description = RELATED_RESOURCES_DESCRIPTION,
}: {
  resources: GuideLink[];
  title?: string;
  description?: string;
}) {
  if (resources.length === 0) return null;

  return (
    <RelatedGuidesBlock
      title={title}
      description={description}
      guides={resources}
    />
  );
}
