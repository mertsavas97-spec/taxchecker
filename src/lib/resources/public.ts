import 'server-only';

import type { ResourceDefinition } from '@/config/resources';
import type { CmsResource } from '@/lib/admin/content/types';
import {
  getPublishedResourceBySlugPublic,
  getPublishedResourceDefinitionBySlugPublic,
  getPublishedResourcesPublic,
  getSitemapResourcesPublic,
} from '@/lib/cms/public-read';

export {
  getPublishedResourcesPublic,
  getPublishedResourceBySlugPublic,
  getPublishedResourceDefinitionBySlugPublic,
  getSitemapResourcesPublic,
};

export async function getPublishedResourceBySlug(
  slug: string,
): Promise<CmsResource | undefined> {
  return getPublishedResourceBySlugPublic(slug);
}

export async function getPublishedResourceDefinition(
  slug: string,
): Promise<ResourceDefinition | undefined> {
  return getPublishedResourceDefinitionBySlugPublic(slug);
}

export async function getPublishedResourceRoutes(): Promise<ResourceDefinition[]> {
  const published = await getPublishedResourcesPublic();
  return published.filter((resource) => resource.route.startsWith('/resources/'));
}
