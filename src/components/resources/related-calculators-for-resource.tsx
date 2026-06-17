import { RelatedCalculatorsBlock } from '@/components/content/related-calculators-block';
import {
  RELATED_CALCULATORS_DESCRIPTION,
  RELATED_CALCULATORS_TITLE,
} from '@/config/related-content';
import type { NavLink } from '@/config/site-navigation';

export function RelatedCalculatorsForResource({
  calculators,
  title = RELATED_CALCULATORS_TITLE,
  description = RELATED_CALCULATORS_DESCRIPTION,
}: {
  calculators: NavLink[];
  title?: string;
  description?: string;
}) {
  if (calculators.length === 0) return null;

  return (
    <RelatedCalculatorsBlock
      title={title}
      description={description}
      calculators={calculators}
    />
  );
}
