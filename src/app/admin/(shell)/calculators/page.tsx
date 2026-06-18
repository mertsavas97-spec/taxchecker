import { CalculatorsManager } from '@/components/admin/calculators-manager';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { SeedSyncPanel } from '@/components/admin/seed-sync-panel';
import { getConfiguredStoreDriver, getStoreDriverLabel } from '@/lib/admin/content/storage';
import { contentRegistry } from '@/lib/admin/content/registry';

export default async function AdminCalculatorsPage() {
  const calculators = await contentRegistry.getCalculators();

  return (
    <div>
      <AdminPageHeader
        title="Calculators"
        description="Calculator metadata registry for annual tax-year reviews. Does not modify calculator logic."
      />

      <SeedSyncPanel storeLabel={getStoreDriverLabel(getConfiguredStoreDriver())} />

      <CalculatorsManager calculators={calculators} />
    </div>
  );
}
