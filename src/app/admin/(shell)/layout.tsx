import { AdminLayout } from '@/components/admin/admin-layout';
import { requireAdminSession } from '@/lib/admin/auth/server';
import { getConfiguredStoreDriver } from '@/lib/admin/content/storage';

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <AdminLayout storeDriver={getConfiguredStoreDriver()}>{children}</AdminLayout>
  );
}
