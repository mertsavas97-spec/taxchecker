import { createTrustPageMetadata } from '@/lib/trust-pages/create-trust-page';
import { EditorialStandardsPage } from '@/components/trust/editorial-standards-page';

export const generateMetadata = () =>
  createTrustPageMetadata('editorial-standards');
export default EditorialStandardsPage;
