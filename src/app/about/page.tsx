import { createTrustPageMetadata } from '@/lib/trust-pages/create-trust-page';
import { AboutPage } from '@/components/trust/about-page';

export const generateMetadata = () => createTrustPageMetadata('about');
export default AboutPage;
