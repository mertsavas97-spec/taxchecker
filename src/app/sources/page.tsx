import { createTrustPageMetadata } from '@/lib/trust-pages/create-trust-page';
import { SourcesPage } from '@/components/trust/sources-page';

export const generateMetadata = () => createTrustPageMetadata('sources');
export default SourcesPage;
