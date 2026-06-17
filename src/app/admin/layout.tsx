import type { Metadata } from 'next';

import { adminNoIndexMetadata } from '@/lib/admin/auth/server';

export const metadata: Metadata = {
  ...adminNoIndexMetadata,
  title: {
    default: 'Admin',
    template: '%s · TaxChecker Admin',
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
