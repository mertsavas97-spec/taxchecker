import {
  resources,
  type ResourceCategoryId,
  type ResourceDefinition,
} from '@/config/resources';

export type { ResourceCategoryId };

export interface ResourceHubCategory {
  id: ResourceCategoryId;
  label: string;
}

export const resourceHubCategories: ResourceHubCategory[] = [
  { id: 'guides', label: 'Guides' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'tax-brackets', label: 'Tax Brackets' },
  { id: 'methodology', label: 'Methodology' },
];

const categoryOrder = resourceHubCategories.map((category) => category.id);

export function getResourceCategoryLabel(categoryId: ResourceCategoryId): string {
  return (
    resourceHubCategories.find((category) => category.id === categoryId)?.label ??
    'Resource'
  );
}

export function getAllHubResources(): ResourceDefinition[] {
  return [...resources].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    const categoryDiff =
      categoryOrder.indexOf(left.category) - categoryOrder.indexOf(right.category);
    if (categoryDiff !== 0) return categoryDiff;

    return left.title.localeCompare(right.title);
  });
}

export function getResourcesForHubCategory(
  categoryId: ResourceCategoryId,
): ResourceDefinition[] {
  return getAllHubResources().filter((resource) => resource.category === categoryId);
}

export function getFeaturedHubResources(): ResourceDefinition[] {
  return getAllHubResources().filter((resource) => resource.featured);
}

/** Top published article resources for homepage preview (excludes /methodology trust route). */
export function getLatestResources(limit = 4): ResourceDefinition[] {
  return getAllHubResources()
    .filter(
      (resource) =>
        resource.status === 'published' && resource.route.startsWith('/resources/'),
    )
    .slice(0, limit);
}
