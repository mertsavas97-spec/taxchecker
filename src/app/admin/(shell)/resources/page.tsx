import { ResourceManager } from '@/components/admin/resource-manager';
import { contentRegistry } from '@/lib/admin/content/registry';

export default async function AdminResourcesPage() {
  const resources = await contentRegistry.getResources();
  return <ResourceManager resources={resources} />;
}
