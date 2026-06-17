import { createTrustPageMetadata } from '@/lib/trust-pages/create-trust-page';
import { MethodologyPage } from '@/components/trust/methodology-page';

export const generateMetadata = () => createTrustPageMetadata('methodology');
export default MethodologyPage;
