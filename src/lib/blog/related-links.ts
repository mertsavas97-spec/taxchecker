import { getCalculatorBySlug } from '@/config/calculators';
import type { CmsBlogPost } from '@/lib/admin/content/types';
import {
  buildReadyCalculatorNavLinks,
  buildRelatedGuideLinks,
} from '@/lib/calculators/related-links';

export function buildRelatedCalculatorsForBlogPost(post: CmsBlogPost) {
  return buildReadyCalculatorNavLinks(post.relatedCalculators);
}

export function buildRelatedResourcesForBlogPost(post: CmsBlogPost) {
  return buildRelatedGuideLinks(post.relatedResources);
}
