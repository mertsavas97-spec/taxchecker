import { createTrustPageMetadata } from '@/lib/trust-pages/create-trust-page';
import { ContactPage } from '@/components/trust/contact-page';

export const generateMetadata = () => createTrustPageMetadata('contact');
export default ContactPage;
