import { notFound } from 'next/navigation';

import { ResourceEditor } from '@/components/admin/resource-editor';
import { contentRegistry } from '@/lib/admin/content/registry';

export default async function AdminResourceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await contentRegistry.getResourceById(id);

  if (!resource) {
    notFound();
  }

  return <ResourceEditor resource={resource} mode="edit" />;
}
