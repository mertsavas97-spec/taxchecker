import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { createResourcePageMetadata } from '@/lib/resources/create-resource-page';
import { renderPublishedCmsResourcePage } from '@/lib/resources/cms-resource-page';
import {
  getPublishedResourceBySlugPublic,
  getPublishedResourceRoutes,
} from '@/lib/resources/public';
import { isStaticResourceArticleSlug } from '@/lib/resources/public-definition';

interface ResourceSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const resources = await getPublishedResourceRoutes();
  return resources
    .filter((resource) => !isStaticResourceArticleSlug(resource.slug))
    .map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({
  params,
}: ResourceSlugPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isStaticResourceArticleSlug(slug)) {
    return {};
  }

  const resource = await getPublishedResourceBySlugPublic(slug);
  if (!resource) {
    return { robots: { index: false, follow: false } };
  }

  return createResourcePageMetadata(slug);
}

export default async function DynamicResourcePage({ params }: ResourceSlugPageProps) {
  const { slug } = await params;

  if (isStaticResourceArticleSlug(slug)) {
    notFound();
  }

  const page = await renderPublishedCmsResourcePage(slug);
  if (!page) {
    notFound();
  }

  return page;
}
