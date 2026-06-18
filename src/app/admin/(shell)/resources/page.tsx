import { ResourceManager } from '@/components/admin/resource-manager';
import { SeedSyncPanel } from '@/components/admin/seed-sync-panel';
import { contentRegistry } from '@/lib/admin/content/registry';
import { getConfiguredStoreDriver, getStoreDriverLabel } from '@/lib/admin/content/storage';

export default async function AdminResourcesPage() {
  const resources = await contentRegistry.getResources();

  return (
    <div>
      <SeedSyncPanel storeLabel={getStoreDriverLabel(getConfiguredStoreDriver())} />
      <ResourceManager resources={resources} />
    </div>
  );
}
